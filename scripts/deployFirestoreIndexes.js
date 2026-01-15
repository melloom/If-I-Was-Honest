const { GoogleAuth } = require('google-auth-library');
const path = require('path');
const fs = require('fs');

const projectId = 'thehonestproject-e49c5';
const serviceAccountPath = path.join(__dirname, '..', 'thehonestproject-e49c5-firebase-adminsdk-fbsvc-e032695b76.json');
const indexesPath = path.join(__dirname, '..', 'firestore.indexes.json');

async function deployIndexes() {
  try {
    console.log('Reading indexes configuration...');
    const indexesConfig = JSON.parse(fs.readFileSync(indexesPath, 'utf8'));

    console.log('Authenticating with service account...');
    const auth = new GoogleAuth({
      keyFile: serviceAccountPath,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });

    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    console.log('Deploying indexes...');
    
    for (const index of indexesConfig.indexes) {
      const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/collectionGroups/${index.collectionGroup}/indexes`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          queryScope: index.queryScope,
          fields: index.fields,
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log(`✓ Created index for ${index.collectionGroup}:`, index.fields.map(f => f.fieldPath).join(', '));
      } else if (result.error?.status === 'ALREADY_EXISTS') {
        console.log(`- Index already exists for ${index.collectionGroup}:`, index.fields.map(f => f.fieldPath).join(', '));
      } else {
        console.error(`✗ Failed to create index for ${index.collectionGroup}:`, result.error?.message || result);
      }
    }

    console.log('\nIndexes deployment complete!');
  } catch (error) {
    console.error('Error deploying indexes:', error.message);
    process.exit(1);
  }
}

deployIndexes();
