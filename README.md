# ezPAARSE-Badge
[![Build Status](https://travis-ci.org/ezpaarse-project/ezpaarse-badge.svg?branch=master)](https://travis-ci.org/ezpaarse-project/ezpaarse-badge)
[![Docker stars](https://img.shields.io/docker/stars/ezpaarseproject/ezpaarse-badge.svg)](https://hub.docker.com/r/ezpaarseproject/ezpaarse-badge/)
[![Docker Pulls](https://img.shields.io/docker/pulls/ezpaarseproject/ezpaarse-badge.svg)](https://hub.docker.com/r/ezpaarseproject/ezpaarse-badge/)

> Node.js server using [OpenBadgeFactory API](https://openbadgefactory.com/developers/#open-badge-factory-rest-api)

## Requirements
+ Node.js v9+
+ OpenSSL

## Configuration
Generate your **certificate signing request token** in **Admin tools &rarr; API key**, use your certificate in **OBF_CERT** (environment variable) and run this command :
```
$ npm run conf
```

## Build Setup
```
$ docker-compose up
```

## Config file
+ port : Application port
+ urlApi : [OpenBadgeFactory API](https://openbadgefactory.com/developers/#open-badge-factory-rest-api)
+ email :
  + subject : Email subject
  + body : Email content, <strong>:recipientName</strong> var replace by user's email
  + button : Text displayed on the badge recovery button
  + footer : Text displayed in email footer
+ logEntry :
  + client : Name of the badge-issuing application
  + issuer : Issuer name
+ mongo :
  + host : Database host
  + port : Database port
  + db : Database name
+ authority : Authority name used to set licence in a badge
+ cacheTime : Time in hours to regenerate cache from server launch
+ continuousIntegration : Allow to launch the server without the certificates presence

## API routes
<table>
  <thead>
    <tr>
      <th>URL</th>
      <th>Action</th>
      <th>Request body</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>GET /</td>
      <td>Give the name and version of the application</td>
      <td></td>
    </tr>
    <tr>
      <td>GET /ping</td>
      <td>Ping OpenBadgeFactory API</td>
      <td></td>
    </tr>
    <tr>
      <td>GET /metrics</td>
      <td>Get total issuances by badge</td>
      <td></td>
    </tr>
    <tr>
      <td>GET /metrics/count</td>
      <td>Get count of badges</td>
      <td></td>
    </tr>
    <tr>
      <td>GET /badges</td>
      <td>Get user's badges</td>
      <td>Query String
        <ul>
          <li><strong>id</strong>: trello id</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td>POST /emit</td>
      <td>Emits badge for user</td>
      <td>JSON
        <ul>
          <li>
            <strong>badgeId</strong>: ID of the badge to be issued</li>
          <li>
            <strong>recipient</strong>
            <ul>
              <li><strong>id</strong>: recipient id (trello id)</li>
              <li><strong>email</strong>: recipient email</li>
              <li><strong>name</strong>: recipient name</li>
            </ul>
          </li>
        </ul>
      </td>
    </tr>
  </tbody>
</table>
