const fs = require('fs');
const path = require('path');
const recursiveReaddir = require('recursive-readdir');
const { orderBy } = require('natural-orderby');
const { PromisePool } = require('@supercharge/promise-pool');

const config = require('../../../config.json');

const RJCODE_REGEX = /R[JE]\d{6,8}/;

/**
 * Returns list of playable tracks in a given folder. Track is an object
 * containing 'title', 'subtitle' and 'hash'.
 * @param {Number} id Work identifier. Currently, RJ/RE code.
 * @param {String} dir Work directory (relative).
 */
const getTrackList = (id, dir) => recursiveReaddir(
  path.join(config.rootDir, dir),
)
  .then((files) => {
    // Filter out any files not matching these extensions
    const filteredFiles = files.filter((file) => {
      const ext = path.extname(file);

      return (ext === '.mp3' || ext === '.ogg' || ext === '.opus' || ext === '.wav' || ext === '.flac' || ext === '.webm' || ext === '.mp4');
    });

    // Sort by folder and title
    const sortedFiles = orderBy(filteredFiles.map((file) => {
      const shortFilePath = file.replace(path.join(config.rootDir, dir, '/'), '');
      const dirName = path.dirname(shortFilePath);

      return {
        title: path.basename(file),
        subtitle: dirName === '.' ? null : dirName,
      };
    }), [(v) => v.subtitle, (v) => v.title]);

    // Add hash to each file
    const sortedHashedFiles = sortedFiles.map(
      (file, index) => ({
        title: file.title,
        subtitle: file.subtitle,
        hash: `${id}/${index}`,
      }),
    );

    return sortedHashedFiles;
  })
  .catch((err) => { throw new Error(`Failed to get tracklist from disk: ${err}`); });

/**
 * Returns list of directory names (relative) that contain an RJ code.
 */
async function* getFolderList(current = '', depth = 0) {
  const folders = await fs.promises.readdir(path.join(config.rootDir, current));

  for (const folder of folders) {
    const absolutePath = path.resolve(config.rootDir, current, folder);
    const relativePath = path.join(current, folder);

    // eslint-disable-next-line no-await-in-loop
    if ((await fs.promises.stat(absolutePath)).isDirectory()) {
      if (folder.match(RJCODE_REGEX)) {
        // Found a work folder, don't go any deeper.
        yield relativePath;
      } else if (depth + 1 < config.scannerMaxRecursionDepth) {
        // Found a folder that's not a work folder, go inside if allowed.
        yield* getFolderList(relativePath, depth + 1);
      }
    }
  }
}

/**
 * Deletes a work's cover image from disk.
 * @param {String} rjcode Work RJ code (only the 6 digits, zero-padded).
 */
const deleteCoverImageFromDisk = (rjcode) => new Promise((resolve, reject) => {
  fs.unlink(path.join(config.rootDir, 'Images', `RJ${rjcode}.jpg`), (err) => {
    if (err) {
      reject(err);
    } else {
      resolve();
    }
  });
});

/**
 * Saves cover image to disk.
 * @param {ReadableStream} stream Image data stream.
 * @param {String} rjcode Work RJ code (only the 6 digits, zero-padded).
 */
const saveCoverImageToDisk = (stream, rjcode) => new Promise((resolve, reject) => {
  // TODO: don't assume image is a jpg?
  try {
    stream.pipe(
      fs.createWriteStream(path.join(config.rootDir, 'Images', `RJ${rjcode}.jpg`))
        .on('close', () => resolve()),
    );
  } catch (err) {
    reject(err);
  }
});

/**
 * Runs an array of Promise returning functions at a specified rate
 * @param {Number} maxPending the maximum number of unresolved promises
 * that may exist at a given time
 * @param {Array<Function>} asyncFuncs an array of promise-creating functions
*/
const throttlePromises = (maxPending, asyncFuncs) => {
  const promisedValues = [];
  return PromisePool
    .withConcurrency(maxPending)
    .for(asyncFuncs)
    .process(
      async (func, index) => func().then((value) => {
        promisedValues[index] = value;
      }),
    ).then(() => promisedValues);
};

/**
 * Parses an RJ code string and returns the numeric identifier
 * @param {string} workid The work id the parse, valid values e.g. 123, RJ123, RJ1234567
 * @returns {Number} The numeric identifier for this work padded to the correct length
 */
const parseRjcode = (workid) => {
  const code = workid.startsWith('RJ') ? workid.slice(2) : workid;
  return code.length <= 6 ? code.padStart(6, '0') : code.padStart(8, '0');
};

module.exports = {
  getTrackList,
  getFolderList,
  deleteCoverImageFromDisk,
  saveCoverImageToDisk,
  throttlePromises,
  parseRjcode,
  RJCODE_REGEX,
};
