#!/usr/bin/env node
/**
 * Deploy Firestore rules using a Service Account JSON via Firebase Rules API.
 * Usage: node scripts/deployFirestoreRules.js <serviceAccountPath> <rulesPath>
 */
const fs = require('fs')
const path = require('path')
const { GoogleAuth } = require('google-auth-library')

async function main() {
  const saPath = process.argv[2] || path.resolve(process.cwd(), 'thehonestproject-e49c5-firebase-adminsdk-fbsvc-e032695b76.json')
  const rulesPath = process.argv[3] || path.resolve(process.cwd(), 'firestore.rules')

  if (!fs.existsSync(saPath)) {
    throw new Error(`Service account JSON not found at: ${saPath}`)
  }
  if (!fs.existsSync(rulesPath)) {
    throw new Error(`Rules file not found at: ${rulesPath}`)
  }

  const sa = JSON.parse(fs.readFileSync(saPath, 'utf8'))
  const projectId = sa.project_id
  if (!projectId) {
    throw new Error('project_id missing in service account JSON')
  }

  const rulesContent = fs.readFileSync(rulesPath, 'utf8')
  if (!rulesContent.trim().startsWith("rules_version")) {
    throw new Error('Rules file must start with rules_version = \"2\";')
  }

  const auth = new GoogleAuth({
    credentials: sa,
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  })
  const client = await auth.getClient()

  // Create a new ruleset
  const createRulesetUrl = `https://firebaserules.googleapis.com/v1/projects/${projectId}/rulesets`
  const rulesetRes = await client.request({
    url: createRulesetUrl,
    method: 'POST',
    data: {
      source: {
        files: [
          {
            name: 'firestore.rules',
            content: rulesContent,
          },
        ],
      },
    },
  })

  const rulesetName = rulesetRes.data && rulesetRes.data.name
  if (!rulesetName) {
    throw new Error('Failed to create ruleset (no name returned).')
  }
  console.log('Created ruleset:', rulesetName)

  // Create or update the cloud.firestore release to point to the new ruleset
  const releaseName = `projects/${projectId}/releases/cloud.firestore`
  const createReleaseUrl = `https://firebaserules.googleapis.com/v1/projects/${projectId}/releases`
  try {
    await client.request({
      url: createReleaseUrl,
      method: 'POST',
      data: {
        name: releaseName,
        rulesetName: rulesetName,
      },
    })
    console.log('Created release:', releaseName)
  } catch (err) {
    const status = err.response && err.response.status
    if (status === 409) {
      // Release exists; update it
      const patchUrl = `https://firebaserules.googleapis.com/v1/${releaseName}?updateMask=rulesetName`
      await client.request({
        url: patchUrl,
        method: 'PATCH',
        data: {
          rulesetName: rulesetName,
        },
      })
      console.log('Updated release:', releaseName)
    } else {
      throw err
    }
  }

  console.log('Firestore rules deployed successfully to project:', projectId)
}

main().catch((err) => {
  console.error('Deploy failed:', err && err.response ? err.response.data || err : err)
  process.exit(1)
})
