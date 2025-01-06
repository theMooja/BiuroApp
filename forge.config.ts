import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { AutoUnpackNativesPlugin } from '@electron-forge/plugin-auto-unpack-natives';


const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    extraResource: ['app-settings.json']
  },
  rebuildConfig: {},
  makers: [new MakerSquirrel({}), new MakerZIP({}, ['darwin']), new MakerRpm({}), new MakerDeb({})],
  plugins: [
    new AutoUnpackNativesPlugin({}),
  ],
  publishers: [
    {
      "name": "@electron-forge/publisher-github",
      "config": {
        "repository": {
          "owner": "theMooja",
          "name": "BiuroApp"
        },
        "prerelease": false,
        "draft": false
      }
    }
  ]
};

export default config;