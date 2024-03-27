const fetch = require('node-fetch');
const htmlparser = require('htmlparser2');

/**
 * Scrapes work metadata from public HVDB page HTML.
 * @param {Integer} id Work id.
 */
const scrapeWorkMetadata = (id) => new Promise((resolve, reject) => {
  const url = `https://hvdb.me/Dashboard/WorkDetails/${id}`;

  fetch(url)
    .then((res) => {
      if (!res.ok) {
        reject(new Error(`Couldn't fetch work page HTML, received ${res.statusText}`));
      }

      return res;
    })
    .then((res) => res.text())
    .then((res) => {
      const work = { id, tags: [], vas: [] };
      let writeTo;

      const parser = new htmlparser.Parser({
        onopentag: (name, attrs) => {
          if (name === 'input') {
            if (attrs.id === 'Name') {
              work.title = attrs.value;
            } else if (attrs.name === 'SFW') {
              work.nsfw = attrs.value === 'false';
            }
          }

          if (name === 'a') {
            if (attrs.href.indexOf('CircleWorks') !== -1) {
              work.circle = {
                id: attrs.href.substring(attrs.href.lastIndexOf('/') + 1),
              };
              writeTo = 'circle.name';
            } else if (attrs.href.indexOf('TagWorks') !== -1) {
              work.tags.push({
                id: attrs.href.substring(attrs.href.lastIndexOf('/') + 1),
              });
              writeTo = 'tag.name';
            } else if (attrs.href.indexOf('CVWorks') !== -1) {
              work.vas.push({
                id: attrs.href.substring(attrs.href.lastIndexOf('/') + 1),
              });
              writeTo = 'va.name';
            }
          }
        },
        onclosetag: () => { writeTo = null; },

        ontext: (text) => {
          switch (writeTo) {
            case 'circle.name':
              if (work.circle.name) {
                work.circle.name += text;
              } else {
                work.circle.name = text;
              }
              break;
            case 'tag.name':
              if (work.tags[work.tags.length - 1].name) {
                work.tags[work.tags.length - 1].name += text;
              } else {
                work.tags[work.tags.length - 1].name = text;
              }
              break;
            case 'va.name':
              if (work.vas[work.vas.length - 1].name) {
                work.vas[work.vas.length - 1].name += text;
              } else {
                work.vas[work.vas.length - 1].name = text;
              }
              break;
            default:
          }
        },
      }, { decodeEntities: true });
      parser.write(res);
      parser.end();

      if (work.tags.length === 0 && work.vas.length === 0) {
        reject(new Error('Couldn\'t parse data from HVDB work page.'));
      } else {
        resolve(work);
      }
    });
});

module.exports = scrapeWorkMetadata;
