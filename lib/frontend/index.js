const bodyParser = require('body-parser')
const express = require('express')
const path = require('path')
const session = require('express-session')
const sslify = require('express-sslify')

const oauth = require('github-oauth')({
  githubClient: process.env.GITHUB_CLIENT_ID,
  githubSecret: process.env.GITHUB_CLIENT_SECRET,
  baseURL: process.env.APP_URL,
  loginURI: '/github/login',
  callbackURI: '/github/callback'
})

const deleteJiraConfiguration = require('./delete-jira-configuration')
const getGitHubConfiguration = require('./get-github-configuration')
const getGitHubLogin = require('./get-github-login')
const getJiraConfiguration = require('./get-jira-configuration')
const postGitHubConfiguration = require('./post-github-configuration')

const getGithubClientMiddleware = require('./github-client-middleware')
const verifyJiraMiddleware = require('./verify-jira-middleware')

function getFrontendApp (appTokenGenerator) {
  const githubClientMiddleware = getGithubClientMiddleware(appTokenGenerator)

  const sessionSettings = {
    secret: process.env.SESSION_SECRET || 'secret',
    cookie: {},
    resave: false,
    saveUninitialized: false
  }

  const app = express()

  // Parse URL-encoded bodies for Jira configuration requests
  app.use(bodyParser.urlencoded({ extended: false }))

  if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', true)
    sessionSettings.cookie.secure = true
  }

  app.use(session(sessionSettings))

  app.set('view engine', 'hbs')
  app.set('views', path.join(__dirname, '..', '..', 'views'))

  app.use('/public', express.static(path.join(__dirname, '..', '..', 'static')))
  app.use('/public/css-reset', express.static(path.join(__dirname, '..', '..', 'node_modules/@atlaskit/css-reset/dist')))
  app.use('/public/primer', express.static(path.join(__dirname, '..', '..', 'node_modules/primer/build')))
  app.use('/public/atlassian-ui-kit', express.static(path.join(__dirname, '..', '..', 'node_modules/@atlaskit/reduced-ui-pack/dist')))

  app.get('/pages/github-login', verifyJiraMiddleware, getGitHubLogin)

  app.get('/pages/github-configuration', githubClientMiddleware, getGitHubConfiguration)
  app.post('/pages/github-configuration', postGitHubConfiguration)

  app.get('/pages/jira-configuration', verifyJiraMiddleware, githubClientMiddleware, getJiraConfiguration)
  app.delete('/pages/jira-configuration', verifyJiraMiddleware, deleteJiraConfiguration)

  oauth.addRoutes(app)
  oauth.on('token', function (token, res, tokenRes, req) {
    req.session.githubToken = token.access_token

    res.redirect('/pages/github-configuration')
  })

  return app
}

module.exports = (robot) => {
  const app = robot.route()

  if (process.env.FORCE_HTTPS) {
    app.use(sslify.HTTPS({ trustProtoHeader: true }))
  }

  app.use(getFrontendApp(robot.app))
}
