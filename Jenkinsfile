@Library('pipeline') _

def version = '21.2000'


node ('controls') { 
    checkout_pipeline("21.2000/bugfix/bls/wasaby_controls_saby_page_v2")
    run_branch = load '/home/sbis/jenkins_pipeline/platforma/branch/run_branch'
    run_branch.execute('wasaby_controls', version)
}