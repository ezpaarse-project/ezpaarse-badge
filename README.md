# ezPAARSE-Badge

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
      <td>GET /badges</td>
      <td>Get user's badges</td>
      <td>Query String
        <ul>
          <li><strong>email</strong>: user's email</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td>GET /emit</td>
      <td>Get user's badges</td>
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
