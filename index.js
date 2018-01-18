const watchdog = require('./lib/watchdog')

module.exports = (robot) => {
  console.log('Yay, the Repo Watchdog was loaded!')

  // Listen only to repository deletion events.
  // https://developer.github.com/v3/activity/events/types/#repositoryevent
  robot.on('repository.deleted', watchdog.check)
}
