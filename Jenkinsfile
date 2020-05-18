@Library('pipeline@git/status') _

def version = '20.4000'


node ('controls') {
    checkout_pipeline("20.4000/bugfix/bls/fix_status")
    run_branch = load '/home/sbis/jenkins_pipeline/platforma/branch/run_branch'
    run_branch.execute('wasaby_controls', version)
}