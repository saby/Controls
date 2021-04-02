@Library('pipeline') _

def version = '21.2000'


node ('controls') { 
    checkout_pipeline("21.2000/feature/may/start-with-ie-020421")
    run_branch = load '/home/sbis/jenkins_pipeline/platforma/branch/run_branch'
    run_branch.execute('wasaby_controls', version)
}