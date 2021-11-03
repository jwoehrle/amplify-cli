import { $TSContext } from 'amplify-cli-core';
import { printer, prompter } from 'amplify-prompts';
import { AppsyncApiInputState } from '../api-input-manager/appsync-api-input-state';
import { migrateResourceToSupportOverride } from './migrate-api-override-resource';

export const checkAppsyncApiResourceMigration = async (context: $TSContext, apiName: string) => {
  const cliState = new AppsyncApiInputState(apiName);
  if (!cliState.cliInputFileExists()) {
    printer.debug('Cli-inputs.json doesnt exist');
    // put spinner here
    const isMigrate = await prompter.yesOrNo(`Do you want to migrate this ${apiName} to support overrides?`, true);
    if (isMigrate) {
      // generate cli-inputs for migration from parameters.json
      await migrateResourceToSupportOverride(apiName);
    }
  }
};