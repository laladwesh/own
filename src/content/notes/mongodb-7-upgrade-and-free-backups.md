---
title: "Upgrading MongoDB to 7.0 on an ARM server, and backing it up to Google Drive"
date: "2026-05"
summary: "Compass warned that MongoDB 6.0 was end of life. How I upgraded to 7.0 on Ubuntu 22.04 ARM, and the daily Google Drive backup that came out of it."
tags: [mongodb, oracle-cloud, linux, backups]
---

## The problem

Compass showed a warning that MongoDB 6.0 had reached end of life. My databases run on an Oracle Cloud ARM server with Ubuntu 22.04, and several apps depend on them.

I did not want to find out what an unsupported database does at a bad moment. Two jobs came out of that warning: move to 7.0, and finally have a backup I could restore from.

## Backup first

Before touching any package, I dumped everything:

```bash
mongodump --out ~/backup-before-7
```

If your database needs a login, add `--uri` with your own connection string. Keep the dump somewhere that is not the folder mongod writes to.

Then the feature compatibility version. MongoDB 7.0 will only start on data files that are at 6.0 compatibility, so I checked it and set it in mongosh:

```javascript
db.adminCommand({ getParameter: 1, featureCompatibilityVersion: 1 })
db.adminCommand({ setFeatureCompatibilityVersion: "6.0" })
```

## Installing 7.0 on arm64

Ubuntu 22.04 is "jammy". The part that is easy to get wrong on ARM is the architecture in the repository line. It has to say `arm64`, or apt goes looking for packages that do not exist for your machine.

```bash
curl -fsSL https://pgp.mongodb.com/server-7.0.asc | \
  sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

echo "deb [ arch=arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
  sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

sudo apt update
sudo apt install -y mongodb-org
```

## What went wrong

The first problem: mongod did not fully upgrade. What fixed it was reinstalling the individual `mongodb-org-*` packages instead of relying on the `mongodb-org` package to pull them all forward:

```bash
sudo apt install --reinstall mongodb-org-server mongodb-org-mongos mongodb-org-tools
sudo systemctl restart mongod
```

I did not dig into why the package did not move everything. If you hit the same thing, check each package version with `apt list --installed | grep mongodb`.

The second problem was smaller and more annoying. I ran mongosh right after the restart and got `ECONNREFUSED`. The server was not ready yet. Wait a few seconds, check `sudo systemctl status mongod`, and try again before you assume something is broken.

## Confirm, update, pin

Once mongosh connected, I checked the version:

```bash
mongosh --eval "db.version()"
```

It reported 7.0.x. Then I applied the pending system updates, and pinned the packages so a later `apt upgrade` cannot move me to 8.0 without me asking:

```bash
sudo apt-mark hold mongodb-org mongodb-org-server mongodb-org-mongos mongodb-org-tools
```

When I want to upgrade on purpose, `apt-mark unhold` releases them.

## Backups to Google Drive

The backup lives inside my status dashboard service, so it runs on the same server as the databases and I do not need another tool to look after.

The pieces:

- the Google Drive API v3, authorised with an OAuth2 refresh token
- node-cron, running every day at 7:30 AM
- `mongodump`, then `tar`, then an upload of the archive to a Drive folder

The shape of the job:

```javascript
cron.schedule("30 7 * * *", async () => {
  // 1. mongodump into a temporary folder
  // 2. tar the folder
  // 3. upload the tar to Drive, then delete the local copy
});
```

Two mistakes cost me time. I had the same environment variable defined twice, and I had used the wrong key names for the Google credentials. If you set this up, make the service print which required keys are missing, by name only and never the values. It would have saved me the guessing.

## Restoring

These are the restore steps, written down before I need them. A backup you have never restored is a guess.

Unpack the archive:

```bash
tar -xf backup.tar
```

Restore one database into the local server, replacing what is there:

```bash
mongorestore --db mydb --drop dump/mydb
```

Restore to a different server:

```bash
mongorestore --uri "mongodb://<user>:<password>@<host>:27017" dump
```

`--drop` deletes the existing collections before restoring them. Be sure which server you are pointing at before you run it.

## What I would do differently

I would rehearse the upgrade on a throwaway server first, so the package problem shows up there and not on the machine my apps use. And I would run a real restore the day the first backup lands, not after I need it.
