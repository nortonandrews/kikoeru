<p align="center">
  <img width="192" height="192" src="static/android-chrome-192x192.png" style="box-shadow: 0px 3px 8px #000">
</p>
A self-hosted web media player for listening to your DLsite voice works.

## Features
- Automatically scrapes metadata from HVDB
- Browse works by circle, tag or VA
- Queue functionality: mix and match tracks from many different works, in whichever order you want

## Quick Start
Requires both Node.js and npm installed in your system to run. Assuming you've downloaded from the releases page:
```bash
# Install dependencies
npm install --only=prod

# Change `rootDir` in `config.json` to the
# directory where you keep your voice works.

# Each folder must have an RJ code somewhere
# in its name for the scanner to detect it.

# Scan works into the database
npm run scan

# Start the server
npm start

# App is now available at http://0.0.0.0:8888
```

If you instead cloned this repository or just want more details, read below:
## Instructions
### Build from source
```bash
# Install dependencies
npm install

# Build app bundle
npm run build

# Start the production server
npm start

# App is now available at http://0.0.0.0:8888
```

### Configuration
#### Media scanner
You must change `rootDir` in the `config.json` file to point to the directory where you keep your voice works. Each work must be a folder containing an RJ code anywhere in its name.

**NOTE:** Even if you're on Windows, you still need to use forward slashes when specifying `rootDir`. For example:
```json
{
  "rootDir": "D:/Downloads/Voice",
  "worksPerPage": 12
}
```

After this is done, you may run the initial scan:
```bash
npm run scan
```
This will create a file named `db.sqlite3`, containing metadata scraped from HVDB for each work found by the scanner. This file can safely be deleted if you wish to rebuild the database. It will also create a folder called `Images` inside your `rootDir` containing work cover images.

Subsequent runs of the scan command will do two things:
- Look for new works and add them to the database
- Remove works which have been deleted from disk since last scan

It is important to note that the scanner has a configurable maximum recursion depth. However, subdirectories *inside* a work do not count towards the maximum. For example, assuming `rootDir` is `/mnt/Voice/`:
```bash
# OK - This work will be detected correctly:
/mnt/Voice/[Atelier Honey] 雨恋女の子守唄 (RJ136105)/

# OK - All the folders will be detected as part of the same work:
/mnt/Voice/RJ130297/mp3/ノイズ有/
/mnt/Voice/RJ130297/mp3/ノイズ無（推奨）/
/mnt/Voice/RJ130297/wav/ノイズ有/
/mnt/Voice/RJ130297/wav/ノイズ無（推奨）/

# OK - As long as `scannerMaxRecursionDepth` is at least 2:
/mnt/Voice/Atelier Honey/[RJ136105] 雨恋女の子守唄/

# OK - As long as `scannerMaxRecursionDepth` is at least 3:
/mnt/Voice/SFW/桃色CODE/【初夏耳かき】道草屋 芹7 ゆうがた【湯船怪談】(RJ253947)/1-帰り道mp3/
/mnt/Voice/SFW/桃色CODE/【初夏耳かき】道草屋 芹7 ゆうがた【湯船怪談】(RJ253947)/2-お風呂場のおはなしmp3/
/mnt/Voice/SFW/桃色CODE/【初夏耳かき】道草屋 芹7 ゆうがた【湯船怪談】(RJ253947)/3-夕焼け花火と耳掃除mp3/

# FAIL - This work won't be detected because there's no RJ code:
/mnt/Voice/雨恋女の子守唄/
```

#### Password protection
If you wish to password protect the web interface, you may change `password` in `config.json`. Be aware that falsy javascript values will turn this feature off (for example, setting `password` to `false` or `0`).

## Disclaimer
At the moment, although this works well enough for regular usage, you can expect to find small quirks and bugs.

This was developed on macOS and tested on Chrome for Android. It should run on Linux. I have no clue about Windows.
