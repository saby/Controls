@Library('pipeline') _

def version = '21.3100'


node ('controls1') {
    checkout_pipeline("21.3100/pea/deploy_rc")
    run_branch = load '/home/sbis/jenkins_pipeline/platforma/branch/run_branch'
    run_branch.execute('wasaby_controls', version)
}