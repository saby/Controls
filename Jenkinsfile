@Library('pipeline') _

def version = '21.2200'


node ('controls') {
    //checkout_pipeline("rc-${version}")
	checkout_pipeline("21.2200/feature/may/new-chrome-310521")
    run_branch = load '/home/sbis/jenkins_pipeline/platforma/branch/run_branch'
    run_branch.execute('wasaby_controls', version)
}