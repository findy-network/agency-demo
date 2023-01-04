const username = 'user-' + new Date().getTime()
let agentJWT = ''

describe('Onboarding demo test using issue credential protocol version 1', () => {
  before(() => {
    cy.exec('findy-agent-cli new-key').then(({ stdout: key }) => {
      const registerCmd =
        'findy-agent-cli authn register ' +
        `-u "${username}" ` +
        '--url "http://localhost:8088" ' +
        '--origin "http://localhost:3000" ' +
        '--key ' +
        key
      cy.exec(registerCmd).then(() => {
        const loginCmd =
          'findy-agent-cli authn login ' +
          `-u "${username}" ` +
          '--url "http://localhost:8088" ' +
          '--origin "http://localhost:3000" ' +
          '--key ' +
          key
        cy.exec(loginCmd).then(({ stdout }) => {
          agentJWT = stdout as string
          const setModeCmd = 'findy-agent-cli agent mode-cmd --auto --jwt ' + agentJWT
          cy.exec(setModeCmd)
        })
      })
    })
  })

  it('successfully completes school use case', () => {
    // Receive ID credential
    cy.visit('/')
    cy.get('[data-cy=try-demo-button]').click()

    cy.get('[data-cy=next-onboarding-step]').click()
    cy.get('[data-cy=use-wallet]').first().click()
    cy.get('[data-cy=small-button]').click()

    cy.get('[data-cy=select-char]').first().click()
    cy.get('[data-cy=next-onboarding-step]').click()
    cy.get('[data-cy=qr-code]').then((elem) => {
      const title = elem.attr('title') || ''
      cy.exec(`findy-agent-cli agent connect --jwt "${agentJWT}" --invitation "${title}"`).then(({ stdout }) => {
        cy.log(stdout)
      })
    })
    cy.get('[data-cy=next-onboarding-step]').click()
    cy.get('circle').should('be.visible')
    cy.get('[data-cy=next-onboarding-step]').click()
    cy.get('[data-cy=next-onboarding-step]').click()
    cy.url().should('be.equal', `${Cypress.config('baseUrl')}/dashboard`)

    // Get into university
    cy.get('[data-cy=select-use-case]').first().click()
    cy.get('[data-cy=start-container]')
    cy.get('[data-cy=small-button]').click()
    cy.get('[data-cy=qr-code]').then((elem) => {
      const title = elem.attr('title') || ''
      cy.exec(`findy-agent-cli agent connect --jwt "${agentJWT}" --invitation "${title}"`).then(({ stdout }) => {
        cy.log(stdout)
      })
    })
    cy.get('[data-cy=section')
    cy.get('[data-cy="small-button"]').click()
    cy.get('circle').should('be.visible')
    cy.get('[data-cy=section')
    cy.get('[data-cy="small-button"]').click()

    cy.get('[data-cy=section')
    cy.get('[data-cy="small-button"]').click()

    cy.get('[data-cy=section')
    cy.get('[data-cy="small-button"]').click()
    cy.get('circle').should('be.visible')
    cy.get('[data-cy=section')
    cy.get('[data-cy="small-button"]').click()

    cy.get('[data-cy=end-container]')
    cy.get('[data-cy=standard-button]').click()
    cy.url().should('be.equal', `${Cypress.config('baseUrl')}/dashboard`)
  })
})
