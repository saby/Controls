@Library('pipeline') _

def version = '20.7000'


node ('controls') {
    checkout_pipeline("20.7000/kua/reset_caret_color")
    run_branch = load '/home/sbis/jenkins_pipeline/platforma/branch/run_branch'
    run_branch.execute('wasaby_controls', version)
}