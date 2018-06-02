const fs = require('fs');
const path = require('path');
const moment = require('moment');

const env = process.env.NODE_ENV === 'production' ? 'prod' : process.env.NODE_ENV === 'staging' ? 'staging' : process.env.NODE_ENV === 'test' ? 'test' : 'dev';


const JSONSettingsFilePath = `${__dirname}/json-settings/settings.${env}.json`;

// Cache JSON settings file
const JSONSettings = JSON.parse(fs.readFileSync(JSONSettingsFilePath));
const appSettings = {};

// Write JSON settings into appSettings and define getters/setters
for (const key in JSONSettings) {
  if (JSONSettings[key].value !== undefined) {
    Object.defineProperty(appSettings, key, {
      enumerable: true,
      configurable: false,
      // Set the prop value -> Writes on json file
      set(val) {
        // Make sure:
        // 1. it's not a readonly property
        // 2. either there are NOT constrained values or the set value is in the constrained values
        if (
          !JSONSettings[key].readonly &&
          (!JSONSettings[key].values ||
            undefined !== JSONSettings[key].values.find(v => v === val))
        ) {
          JSONSettings[key].value = val;
          try {
            fs.writeFileSync(
              JSONSettingsFilePath,
              JSON.stringify(JSONSettings, null, 4)
            );
          } catch (err) {
            // Todo: log this, do smt usefull
          }
        }
      },
      get() {
        return JSONSettings[key].value;
      },
    });
  }
}

// Exclude non-public properties to be serialized (thus send to client)
appSettings.toJSON = function () {
  return JSON.stringify(
    Object.assign({}, this, { toJSON: undefined }),
    (key, value) => {
      if (
        key &&
        ((JSONSettings[key] && !JSONSettings[key].public) || !JSONSettings[key])
      ) {
        return undefined;
      }

      return value;
    }
  );
};

// Define dynamic properties here (DON'T forget to add readonly/public descriptors to JSON anyway for this props)
Object.defineProperty(appSettings, 'PROJECT_DIR', {
  configurable: false,
  enumerable: true,
  get() {
    return __dirname;
  },
});

// Define dynamic properties here (DON'T forget to add readonly/public descriptors to JSON anyway for this props)
Object.defineProperty(appSettings, 'APP_PORT', {
  configurable: false,
  enumerable: true,
  get() {
    return process.env.port || 3005;
  },
});

Object.defineProperty(appSettings, 'SERVER_ADDRESS', {
  configurable: false,
  enumerable: true,
  get() {
    return `${(process.env.HTTPS === 'true' ? 'https://' : 'http://') +
      (process.env.HOST_IP ? process.env.HOST_IP : 'localhost')}:${
      appSettings.APP_PORT
    }`;
  },
});

Object.defineProperty(appSettings, 'DB', {
  configurable: false,
  enumerable: true,
  get() {
    const dbOptions = {
      host: appSettings.MONGO_DB_HOST,
      database: appSettings.MONGO_DB_DB_NAME,
      port: appSettings.MONGO_DB_PORT || 27017,
    };

    if (appSettings.MONGO_DB_AUTH) {
      dbOptions.user = process.env.APP_DB_USER;
      dbOptions.pass = process.env.APP_DB_PASS;
    }

    return dbOptions;
  },
});

Object.defineProperty(appSettings, 'ALLOWED_CORS_ORIGINS', {
  configurable: false,
  enumerable: true,
  get() {
    if (process.env.NODE_ENV === 'production') return 'xx://xx/xxx';
    return 'x://xx/xxx';
  },
});

Object.defineProperty(appSettings, 'DATETIME_FORMAT', {
  configurable: false,
  enumerable: true,
  get() {
    return moment.defaultFormat;
  },
});

// Seal the object so only defined setters can be used to change anything
Object.seal(appSettings);

const folderSettings = {
  PROJECT_DIR: appSettings.PROJECT_DIR,
  get PUBLIC_STATICS_FOLDER() {
    return path.join(this.PROJECT_DIR, appSettings.STATICS_FOLDER);
  },
  get SERVER_ADMIN_IMAGES_FOLDER() {
    return path.join(
      this.PUBLIC_STATICS_FOLDER,
      appSettings.ADMIN_IMAGES_FOLDER_NAME,
      '/'
    );
  },
  get SERVER_SYS_IMAGES_FOLDER() {
    return path.join(
      this.PUBLIC_STATICS_FOLDER,
      appSettings.SYS_IMAGES_FOLDER_NAME,
      '/'
    );
  },
  get PUBLIC_ADMIN_IMAGES_FOLDER() {
    return `${appSettings.SERVER_ADDRESS +
      appSettings.ADMIN_IMAGES_FOLDER_NAME}/`;
  },
};

module.exports = {
  folderSettings,
  appSettings,
  JSONSettingsFilePath,
};
