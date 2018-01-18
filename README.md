# Repo Watchdog

Repo Watchdog is a 🤖 that listens for repository deletion events in organizations. If a repository is deleted, then an [issue](https://help.github.com/articles/about-issues/) is created in another repository in the same organization as the deleted repository ([example](https://github.com/lars-test-org/repo1/issues/1)).

## Getting Started

The 🤖 is a [GitHub App](http://developer.github.com/apps) written in JavaScript and built with [probot](https://probot.github.io/) on top of [Node.js](https://nodejs.org/). 

Please perform the following steps to setup the app:
1. [Install Node.js](https://nodejs.org/en/download/)
2. [Install npm](https://docs.npmjs.com/getting-started/installing-node), the Node.js package manager
3. Clone the repository to your machine:
```
git clone https://github.com/lars-travis-test/repo-watchdog-bot
```
4. Make the repository your current directory:
```
cd repo-watchdog-bot
```
5. Install required npm dependencies:
```
npm install
```

 :tada: Congratulations! You successfully completed the setup and you can start hacking. The file [lib/watchdog.js](lib/watchdog.js) contains the main logic of the app. Make sure all tests pass after your changes:
```
npm test
```

## Deploy "Repo Watchdog" on your GitHub Enterprise appliance
Ensure you are running at least [GitHub Enterprise 2.12](https://enterprise.github.com/releases/2.12.3/notes). Furthermore, ensure that you have enabled the GitHub apps early access technical preview (please talk to your GitHub representative for more information). 

1. Provision a machine called *webhook-server* within your company network that can receive connections *from* and establish connections *to* your GitHub Enterprise appliance (check your company firewall configuration!).
2. Perform the setup steps described in the "Getting Started" section above on your webhook-server.
3. Navigate to your GitHub Enterprise appliance and [create a GitHub App](https://developer.github.com/enterprise/2.12/apps/building-github-apps/creating-a-github-app/) with the following properties:
    - GitHub App name: `Repo Watchdog`
    - Homepage URL: `https://github.com/lars-travis-test/repo-watchdog-bot`
    - Webhook URL: `< the IP address or domain name of your webhook-server >`
    - Webhook secret: `<random secret (e.g. 1TAqfkFO2y)>`
    - Permission:
      - Issues: `Read & write`
      - Everything else: `No access`
    - Subscribe to events: `Repository`
    - Where can this GitHub App be installed?: `Any account`
4. Generate a private key if you haven't done that already. Store the private key (usually named `<something>.pem`) on your webhook-server.
5. Copy the file [`.env.example`](.env.example) in your "Repo Watchdog" repository to the file `.env` and adjust the following lines:
```
# The ID of your GitHub App from the "About" section on 
# the "General" tab of the app on your GitHub Enterprise
# appliance.
APP_ID=123

# The secret you defined during GitHub App creation above.
WEBHOOK_SECRET=<random secret>

# Path to the previously mentioned private key on your webhook server.
PRIVATE_KEY_PATH=/path/to/repo-watchdog.2018-01-18.private-key.pem

# Domain name of your GitHub Enterprise appliance.
GHE_HOST=<your-github-enterprise-server>
``` 

6. Start the 🤖 on your webhook-server.  Ideally, you want to configure an [auto-start on boot](https://www.digitalocean.com/community/tutorials/how-to-configure-a-linux-service-to-start-automatically-after-a-crash-or-reboot-part-1-practical-examples).
```
npm start
```

## Install "Repo Watchdog"

Navigate to your GitHub Enterprise appliance and [install](https://help.github.com/articles/installing-an-app-in-your-organization/) the "Repo Watchdog" app in your organization. E.g. via:
```
https://<your-github-enterprise-server>/settings/apps/repo-watchdog/installations
````
Make sure to select "All repositories" in the install dialog.

:tada: Hooray, you have successfully installed your "Repo Watchdog" :tada:

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for info on working on "Repo Watchdog" and sending patches.


## Need Help?

Contact [GitHub Enterprise Support](https://enterprise.github.com/support) or your friendly GitHub Service Account Engineer.
