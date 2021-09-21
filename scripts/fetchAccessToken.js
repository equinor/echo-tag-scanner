/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

const fs = require('fs');
const msal = require('@azure/msal-node');
const cypressEnv = require('../cypress.env.json');

function sleep(millis) {
  return new Promise(resolve => setTimeout(resolve, millis));
}

async function fetchAccessToken() {
  const config = {
    auth: cypressEnv.auth
  };
  
  // Create msal application object
  const cca = new msal.ConfidentialClientApplication(config);
  
  // With client credentials flows permissions need to be granted in the portal by a tenant administrator.
  // The scope is always in the format "<resource>/.default"
  const clientCredentialRequest = {
    scopes: cypressEnv.scopes
  };
  
  const result = await cca
    .acquireTokenByClientCredential(clientCredentialRequest)
    .then((response) => {
      return response.accessToken;
    })
    .catch((error) => {
      console.log(JSON.stringify(error));
    });

  return result
}

async function main() {
  const accessToken = await fetchAccessToken();
  const updatedEnv = { ...cypressEnv, accessToken };
  fs.writeFileSync('cypress.env.json', JSON.stringify(updatedEnv), { encoding:'utf8', flag:'w' })
}

main()

