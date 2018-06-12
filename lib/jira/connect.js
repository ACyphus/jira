module.exports = async (req, res) => {
  const isHttps = req.secure || req.header('x-forwarded-proto') === 'https'

  return res.status(200)
    .json({
      name: 'GitHub Integration',
      description: 'Application for integrating with GitHub',
      key: 'com.github.integration',
      baseUrl: `${isHttps ? 'https' : 'http'}://${req.get('host')}`,
      lifecycle: {
        installed: '/jira/events/installed',
        uninstalled: '/jira/events/uninstalled',
        enabled: '/jira/events/enabled',
        disabled: '/jira/events/disabled'
      },
      vendor: {
        name: 'GitHub',
        url: 'http://www.github.com'
      },
      authentication: {
        type: 'jwt'
      },
      scopes: [
        'READ',
        'WRITE',
        'ADMIN'
      ],
      apiVersion: 1,
      modules: {
        jiraDevelopmentTool: {
          application: {
            value: 'GitHub'
          },
          capabilities: [
            'commit'
          ],
          key: 'github-development-tool',
          logoUrl: 'https://assets-cdn.github.com/images/modules/logos_page/GitHub-Mark.png',
          name: {
            value: 'GitHub'
          },
          url: 'https://github.com'
        },
        jiraProjectPages: [
          {
            key: 'github-permissions',
            name: {
              value: 'GitHub Permissions'
            },
            url: '/pages/permissions',
            weight: 1
          }
        ]
      }
    })
}
