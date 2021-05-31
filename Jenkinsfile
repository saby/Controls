@Library('pipeline') _

def version = '21.3000'


node ('controls') {
    //checkout_pipeline("rc-${version}")
	checkout_pipeline("21.3000/feature/may/new_chrome-310521")
    run_branch = load '/home/sbis/jenkins_pipeline/platforma/branch/run_branch'
    run_branch.execute('wasaby_controls', version)
}