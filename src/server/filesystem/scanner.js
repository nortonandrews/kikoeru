/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const db = require('../database/db');
const { getFolderList, deleteCoverImageFromDisk, saveCoverImageToDisk, throttlePromises } = require('./utils');
const { createSchema } = require('../database/schema');
const scrapeWorkMetadata = require('../hvdb');

const config = require('../../../config.json');

/**
 * Takes a single folder, fetches metadata and adds it to the database.
 * @param {*} id Work id.
 * @param {*} folder Directory name (relative).
 */
const processFolder = (id, folder) => db.knex('t_work')
  .where('id', '=', id)
  .count()
  .first()
  .then((res) => {
    const count = res['count(*)'];

    if (count) {
      // Already in database.
      // console.log(` * ${folder} already in database, skipping.`);
      return 'skipped';
    }

    // New folder.
    console.log(` * Found new folder: ${folder}`);
    const rjcode = (`000000${id}`).slice(-6); // zero-pad to 6 digits

    console.log(` -> [RJ${rjcode}] Fetching metadata from HVDB...`);
    return scrapeWorkMetadata(id)
      .then((metadata) => {
        console.log(` -> [RJ${rjcode}] Fetched metadata! Adding to database...`);

        // TODO: cover download could be in parallel with metadata fetch. Haven't
        // done it because if metadata fails, cover is useless. Consider for later.
        console.log(` -> [RJ${rjcode}] Downloading cover image...`);
        fetch(`https://hvdb.me/WorkImages/RJ${rjcode}.jpg`)
          .then((imageRes) => {
            if (!imageRes.ok) {
              throw new Error(imageRes.statusText);
            }

            return imageRes;
          })
          .then((imageRes) => {
            saveCoverImageToDisk(imageRes.body, rjcode)
              .then(() => console.log(` -> [RJ${rjcode}] Cover image downloaded!`));
          })
          .catch((err) => {
            console.log(`  ! [RJ${rjcode}] Failed to download cover image: ${err.message}`);
          });

        // eslint-disable-next-line no-param-reassign
        metadata.dir = folder;
        return db.insertWorkMetadata(metadata)
          .then(console.log(` -> [RJ${rjcode}] Finished adding to the database!`))
          .then(() => 'added');
      })
      .catch((err) => {
        console.log(`  ! [RJ${rjcode}] Failed to fetch metadata from HVDB: ${err.message}`);
        return 'failed';
      });
  });

const performCleanup = () => {
  console.log(' * Looking for folders to clean up...');
  return db.knex('t_work')
    .select('id', 'dir')
    .then((works) => {
      const promises = works.map(work => new Promise((resolve, reject) => {
        if (!fs.existsSync(path.join(config.rootDir, work.dir))) {
          console.warn(` ! ${work.dir} is missing from filesystem. Removing from database...`);
          db.removeWork(work.id)
            .then((result) => {
              const rjcode = (`000000${work.id}`).slice(-6); // zero-pad to 6 digits
              deleteCoverImageFromDisk(rjcode)
                .catch(() => console.log(` -> [RJ${rjcode}] Failed to delete cover image.`))
                .then(() => resolve(result));
            })
            .catch(err => reject(err));
        } else {
          resolve();
        }
      }));

      return Promise.all(promises);
    });
};

const performScan = () => {
  fs.mkdir(path.join(config.rootDir, 'Images'), (direrr) => {
    if (direrr && direrr.code !== 'EEXIST') {
      console.error(` ! ERROR while trying to create Images folder: ${direrr.code}`);
      process.exit(1);
    }

    createSchema()
      .then(() => performCleanup())
      .catch((err) => {
        console.error(` ! ERROR while performing cleanup: ${err.message}`);
        process.exit(1);
      })
      .then(async () => {
        console.log(' * Finished cleanup. Starting scan...');
        const promises = [];

        try {
          for await (const folder of getFolderList()) {
            const id = folder.match(/RJ(\d{6})/)[1];
            promises.push(() => processFolder(id, folder));
            
          }
        } catch (err) {
          console.error(` ! ERROR while trying to get folder list: ${err.message}`);
          process.exit(1);
        }

        throttlePromises(config.maxParallelism, promises)
          .then((results) => {
            const counts = {
              added: 0,
              failed: 0,
              skipped: 0,
            };

            // eslint-disable-next-line no-return-assign
            results.forEach(x => counts[x] += 1);

            console.log(` * Finished scan. Added ${counts.added}, skipped ${counts.skipped} and failed to add ${counts.failed} works.`);
            db.knex.destroy();
          })
          .catch((err) => {
            console.error(` ! ERROR while performing scan: ${err.message}`);
            process.exit(1);
          });
      })
      .catch((err) => {
        console.error(` ! ERROR while creating database schema: ${err.message}`);
        process.exit(1);
      });
  });
};

performScan();
