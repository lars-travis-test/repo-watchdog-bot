const watchdog = require('../lib/watchdog')

test('delete repository in a personal space (not in an organization!)', async () => {
  const context = {
    payload: {
      repository: {
        full_name: 'test-org/deleted-repo',
        owner: { type: 'User' }
      },
      sender: { login: 'test-user' }
    }
  }

  try {
    await watchdog.check(context)
    throw new Error('Expected error but none was raised')
  } catch (err) {
    expect(err.message).toEqual(
      'The repository test-org/deleted-repo was deleted by test-user. ' +
      'Ignoring the deletion as the repository was not in an organization.'
    )
  }
})

test('delete last repository in organization', async () => {
  const context = {
    payload: {
      repository: {
        full_name: 'test-org/deleted-repo',
        owner: { type: 'Organization' }
      },
      sender: { login: 'test-user' },
      organization: { login: 'test-org' }
    },
    github: {
      repos: {
        // The organization has no repositories anymore.
        // Therefore, we return an empty repository array.
        getForOrg: jest.fn().mockImplementation(() => Promise.resolve({ data: [] }))
      }
    }
  }

  try {
    await watchdog.check(context)
    throw new Error('Expected error but none was raised')
  } catch (err) {
    expect(err.message).toEqual(
      'The repository test-org/deleted-repo was deleted by test-user. ' +
      'There is no more repository in test-org to create an issue about the event.')
  }

  expect(context.github.repos.getForOrg).toHaveBeenCalledWith({
    'org': 'test-org',
    'type': 'all',
    'page': 1,
    'per_page': 1
  })
})

test('delete repository', async () => {
  const context = {
    payload: {
      repository: {
        full_name: 'test-org/deleted-repo',
        owner: { type: 'Organization' }
      },
      sender: { login: 'test-user' },
      organization: { login: 'test-org' }
    },
    github: {
      repos: {
        // One repository remains in the organization after the deletion.
        // Return it here.
        getForOrg: jest.fn().mockImplementation(() => Promise.resolve({
          data: [{
            name: 'remaining-repo',
            full_name: 'test-org/remaining-repo',
            owner: { login: 'test-org' }
          }]
        }))
      },
      issues: {
        // Mock the creation of an issue in the remaining repository.
        create: jest.fn().mockImplementation()
      }
    }
  }

  await watchdog.check(context)

  expect(context.github.repos.getForOrg).toHaveBeenCalledWith({
    'org': 'test-org',
    'type': 'all',
    'page': 1,
    'per_page': 1
  })

  expect(context.github.issues.create).toHaveBeenCalledWith({
    'body': ':warning: The repository test-org/deleted-repo was deleted by @test-user.\n\n' +
            '@larsxschneider you might want to look at this!',
    'repo': 'remaining-repo',
    'owner': 'test-org',
    'title': 'test-org/deleted-repo deleted'
  })
})
