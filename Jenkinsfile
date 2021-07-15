@Library('pipeline') _

def version = '21.4000'


node ('controls') { 
    checkout_pipeline("21.4000/kua/builder_engine_rev")
    run_branch = load '/home/sbis/jenkins_pipeline/platforma/branch/run_branch'
    run_branch.execute('wasaby_controls', version)
}