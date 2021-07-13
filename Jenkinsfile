@Library('pipeline') _

def version = '21.5000'


node ('controls') { 
    checkout_pipeline("rc-${version}")
    run_branch = load '/home/sbis/jenkins_pipeline/platforma/branch/run_branch'
    sh "sleep 20"
    return
    run_branch.execute('wasaby_controls', version)
}