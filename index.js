const fs = require('fs');
const axios = require('axios');
const AdmZip = require('adm-zip');

async function downloadAndInstall(pkgname, variant = 'goat') {
  const installData = require('./install.json');
  const packages = installData.packages || [];

  if (!packages.length) {
    console.log('📦 🐐 Goat: Error - No packages found in \'install.json\'.');
    return;
  }

  const pkg = packages[0][pkgname];

  if (!pkg) {
    console.log(`📦 🐐 Goat: Error - Package '${pkgname}' not found.`);
    return;
  }

  const pkgurl = variant !== 'goat' && pkg.variants ? pkg.variants[variant] : pkg.url;
  const isModule = pkg.is_module || 'no';

  // Download the file
  const zipFilename = `${pkgname}.zip`;

  try {
    const response = await axios({
      url: pkgurl,
      method: 'GET',
      responseType: 'stream',
    });

    const totalSize = response.headers['content-length'];
    let downloadedSize = 0;

    response.data.on('data', (chunk) => {
      downloadedSize += chunk.length;
      const progress = (downloadedSize / totalSize) * 100;
      process.stdout.write(`📦 🐐 Goat: Downloading ${pkgname}: ${progress.toFixed(2)}%\r`);
    });

    const writer = fs.createWriteStream(zipFilename);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    console.log(`📦 🐐 Goat: ${pkgname} downloaded, size: ${downloadedSize} bytes`);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log(`📦 🐐 Goat: Error - Package '${pkgname}' not found (HTTP 404).`);
    } else if (error.response && error.response.status === 403) {
      console.log(`📦 🐐 Goat: Error - Access to '${pkgurl}' is forbidden (HTTP 403).`);
    } else {
      console.log(`📦 🐐 Goat: Error - HTTP Error ${error.response ? error.response.status : 'Unknown'}: ${error.message}.`);
    }

    return;
  }

  // Check if the downloaded file is a zip file
  const zip = new AdmZip(zipFilename);

  if (zip.getEntries().length === 0) {
    console.log(`📦 🐐 Goat: Error - The downloaded file for ${pkgname} is not a valid zip file. Aborting.`);
    return;
  }

  // Determine the extraction directory
  const extractDir = isModule === 'yes' ? `./${pkgname}` : '.';

  // Unzip the file
  zip.extractAllTo(extractDir, true);

  // Remove the downloaded zip file
  fs.unlinkSync(zipFilename);

  if (isModule === 'yes') {
    console.log(`📦 🐐 Goat: ${pkgname} has been unzipped into the directory '${pkgname}'.`);
  } else {
    console.log(`📦 🐐 Goat: ${pkgname} has been unzipped into the file system.`);
  }
}

// Example usage
downloadAndInstall('a_goat_image');
