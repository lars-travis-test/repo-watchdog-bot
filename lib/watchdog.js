module.exports = {

  async check (context) {
    const deletedRepo = context.payload.repository // The deleted repository.
    const deletedByUser = context.payload.sender   // The user who deleted the repository.
    const org = context.payload.organization       // The organization of the deleted repository.

    // Check if the deleted repository was in an organization.
    // Note: The docs indicate that the 'deleted' action is only
    //       triggered for organization hooks. However,
    //       github.com (2018-01-18) and GitHub Enterprise 2.12
    //       trigger this action on a personal repository, too.
    if (org === undefined || deletedRepo.owner.type !== 'Organization') {
      throw new Error(
        `The repository ${deletedRepo.full_name} was deleted by ` +
        `${deletedByUser.login}. Ignoring the deletion as the ` +
        `repository was not in an organization.`
      )
    }

    // Get the first remaining repository of the aforementioned organization.
    // Watch out, we might get no results here if the organization has no
    // more repositories.
    // https://octokit.github.io/rest.js/#api-Repos-getForOrg
    const repos = await context.github.repos.getForOrg({
      org: org.login,
      type: 'all',
      page: 1,
      per_page: 1
    })

    // Check if we found at least one remaining repository in the organization.
    if (repos.data.length > 0) {
      const notifyRepo = repos.data[0]
      console.log(
        `The repository ${deletedRepo.full_name} was deleted by ` +
        `${deletedByUser.login}. Creating an issue about the ` +
        `event in ${notifyRepo.full_name}.`
      )

      // Create an issue about the deletion event
      // https://octokit.github.io/rest.js/#api-Issues-create
      // Note: Repositories can disabled issues in the settings.
      //       In this case the issue creation would return a
      //       HTTP code 410 (Gone).
      return context.github.issues.create({
        title: `${deletedRepo.full_name} deleted`,
        owner: notifyRepo.owner.login,
        repo: notifyRepo.name,
        body: `:warning: The repository ${deletedRepo.full_name} ` +
               `was deleted by @${deletedByUser.login}.\n\n` +
               `@larsxschneider you might want to look at this!`
      })
    } else {
      throw new Error(
        `The repository ${deletedRepo.full_name} was deleted by ` +
        `${deletedByUser.login}. There is no more repository in ` +
        `${org.login} to create an issue about the event.`
      )
    }
  }

}
