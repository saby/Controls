@Library('pipeline') _

def version = '21.2000'


node ('controls') {
    //checkout_pipeline("rc-${version}")
    checkout_pipeline("21.2000/feature/may/rmi-with-controls-160321")
    run_branch = load '/home/sbis/jenkins_pipeline/platforma/branch/run_branch'
    run_branch.execute('wasaby_controls', version)
}