# ezPAARSE-Badge

> Node.js server using [OpenBadgeFactory API](https://openbadgefactory.com/developers/#open-badge-factory-rest-api)

## Requirements
+ Node.js v8+
+ OpenSSL

## Configuration
Generate your **certificate signing request token** in **Admin tools->API key**, past your certificate in **cert.tokens** file and run this command :
```
$ npm run conf
```

## Build Setup
```
$ docker-compose up
```

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
      <td>JSON
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
              <li><strong>email</strong>: recipient email</li>
              <li><strong>name</strong>: recipient name</li>
            </ul>
          </li>
        </ul>
      </td>
    </tr>
  </tbody>
</table>