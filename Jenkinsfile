@Library('pipeline') _

def version = '20.3000'


node ('controls') {
    checkout_pipeline("20.3000/pea/test_in_new_version")
    run_branch = load '/home/sbis/jenkins_pipeline/platforma/branch/run_branch'
    run_branch.execute('wasaby_controls', version)
}
