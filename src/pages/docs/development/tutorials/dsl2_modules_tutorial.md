---
title: 'Tutorial: Create a DSL2 Module'
subtitle: Creating a new module for the nf-core modules repository.
---

In this tutorial we will see how to create a new module for the nf-core modules repository. As an example, we will create a module to execute the FastqToBam function of the [FGBIO](http://fulcrumgenomics.github.io/fgbio/) suite of tools.

## Introduction

If you create a new module with the goal of contributing the code to _nf-core_, we recommend to familiarise with the community guidelines and use _nf-core tools_ as explained below.

### Module guidelines

The nf-core community has agreed on a minimal set of [guidelines](https://github.com/nf-core/modules#guidelines), intended to make module most suitable for general use, i.e. to be shared across a wide variety of community workflows.

### nf-core tools

Using [nf-core tools](https://nf-co.re/tools) is the best way to adhere to the guidelines, without worrying too much and writing things from scratch.
On the website you can find more details about [installation](https://nf-co.re/tools#installation), and all functionalities for [modules](https://nf-co.re/tools#modules).

### Test data

Even before beginning the development of a module, you should identify a small dataset you can use to test its functionality. Ideally, the dataset is existing already and can be shared with other test workflows for other modules.

> :recycle: This is in active development, keep an eye for available test data [here](https://github.com/nf-core/test-datasets/tree/modules/data) and how to access them using a config file (see this [change](https://github.com/nf-core/modules/pull/365)).

---

## Fork the nf-core/modules repository and branch

The first step, to contribute a module to the community repository is to fork \*nf-core modules into your own account or organisation. To do this, you should click on the top-right of the nf-core modules repository, and choose "fork" as shown in the figure below.

![fork](/assets/markdown_assets/contributing/dsl2_modules_tutorial/dsl2-mod_01_fork.png)

You then choose the account or organisation you want to fork the repository into. Once forked, you can commit all changes you need into the new repository.

In order to create a new module, it is best to branch the code into a recognisable branch. You can do this in two ways.

- You can create a new branch locally, on the terminal, using the following command:

  - ```bash
    git checkout -b newmodule
    ```

  - The branch will be synchronised with your remote once you push the first new commit.

- You can use the GitHub interface

  - To do this, you can select the dropdown menu on the top-left of your repository code, write the name of the new branch and choose to create it as shown below:

    ![branch](/assets/markdown_assets/contributing/dsl2_modules_tutorial/dsl2-mod_02_new_branch.png)

  - You will then sync this locally (ideally, you clone the forked repository on your working environment to edit code more comfortably)

## Create the module template

Using [nf-core/tools](https://github.com/nf-core/tools) it is very easy to create a new module. In our example, we change directory into the repository (_modules_) and we type

```bash
nf-core modules create fgbio/fastqtobam
```

- The first word indicates the tool (i.e. the software or suite)
- We separate the keys by a forward slash (`/`)
- The second word indicates the function of the tool we are creating a module for

Magic will happen now: nf-core tools will create the following entries for the code of the module itself

```console
software/fgbio
└── fastqtobam
    ├── functions.nf
    ├── main.nf
    └── meta.yml
```

And also the following for the testing of the module

```console
tests/software/fgbio
└── fastqtobam
    ├── main.nf
    └── test.yml
```

Each of the files is pre-filled according to a defined nf-core template.

You fill find a number of commented sections in the file, to help you modify the code while adhering to the guidelines, as you can appreciate in the following figure.

![module](/assets/markdown_assets/contributing/dsl2_modules_tutorial/dsl2-mod_03_create_module.png)

The above represents the main code of your module, which will need to be changed.
NF-core tools will attempt at retrieving the correct containers (for Docker and for Singularity) as well as the Conda recipe, and those files will be pre-filled for you.

Now you just have to write the code.

## Write the code

FGBIO command line for the function _FastqToBam_ looks like the following:

```bash
fgbio --tmp-dir=tmpFolder \\
    FastqToBam \\
    -i read1_fastq.gz read2_fastq.gz \\
    -o "sampleID_umi_converted.bam" \\
    --read-structures "+T 12M11S+T" \\
    --sample "sampleID" \\
    --library "sampleID"
```

Here you should first identify:

- the inputs you need, which are mandatory
- the inputs / arguments, which are optional
- the outputs
- any value or variable you might need, associated with the sample (for example, the sample ID or other metadata)

### Inputs and Outputs

As described in the guidelines, any sample-specific information should be passed as an input, as part of a groovy map called _meta_. This is part of a tuple which includes the read file(s).

In our case, FGBIO also has a mandatory argument, which is not sample-specific, i.e. the read structure: this refers to the position and structure of the UMI barcode in the read. Such information will be the same for all samples and characteristics of the kit used to prepare the sequencing library. Since it is not sample specific, we will not include it in the _meta_ map. Since it is a mandatory argument, we have decided to add it to the input list: in this way, it will be visible to others who wish to reuse this module, and it will be described explicitly in the metadata YAML file.

Therefore, once we modify the template accordingly, our inputs and outputs will look like this:

```nextflow
input:
    tuple val(meta), path(reads)
    val(read_structure)

output:
    tuple val(meta), path("*_umi_converted.bam"), emit: umibam
    path "*.version.txt"          , emit: version
```

### Passing options.args

Any optional parameter should be passed within a groovy map called options, and identified as a string within _args_.
In our specific case, we are not using any optional argument and therefore we will include the module and initialise this with an empty string in our test workflow.

```nextflow
include { FGBIO_FASTQTOBAM } from '../../../../modules/fgbio/fastqtobam/main.nf' addParams( options: [args: ''] )
```

But we will add this into the script code, so any other user who might want to execute the function with additional arguments will be able to.
The code of the script will therefore look like this, once we have substituted inputs and outputs as appropriate.

```bash
mkdir tmpFolder

fgbio --tmp-dir=${PWD}/tmpFolder \\
FastqToBam \\
-i ${reads} \\
-o "${prefix}_umi_converted.bam" \\
--read-structures $read_structure \\
--sample ${meta.id} \\
--library ${meta.id} ${options.args}
```

Before wrapping up our code, we need to add a line to output the software version.

Usually a software prints their version with a code similar to this

```bash
tool --version >${software}.version.txt
```

However, in some cases the software outputs the version as _stderr_ and causes an exit that is recognised by Nextflow as if the process ended with an error.

In order to avoid that, we can in general print the version as part of an echo statement, like this

```nextflow
echo \$(tool --version 2>&1) >${software}.version.txt
```

Notice the escape `\$` of the first `$` sign to distinguish between _bash_ variables and _nextflow_ variables.

Unfortunately, FGBIO manages to cause an error exit even with this solution, and we are therefore forced to output the version as a string, like this

```nextflow
def VERSION = '1.3.0'
```

and then in the script

```bash
echo $VERSION >${software}.version.txt
```

Our final script will therefore look like this:

```nextflow
// Import generic module functions
include { initOptions; saveFiles; getSoftwareName } from './functions'

params.options = [:]
options        = initOptions(params.options)

def VERSION = '1.3.0'

/*
unfortunately need to output the version manually
as done for module
https://github.com/nf-core/modules/blob/master/software/homer/annotatepeaks/main.nf
because the solution adopted in iVar, i.e.
echo \$(fgbio --version 2>&1) >${software}.version.txt
for FGBIO still generates an error exit in Nextflow for some reasons
*/

process FGBIO_FASTQTOBAM {
    tag "$meta.id"
    label 'process_low'
    publishDir "${params.outdir}",
        mode: params.publish_dir_mode,
        saveAs: { filename -> saveFiles(filename:filename, options:params.options, publish_dir:getSoftwareName(task.process), publish_id:meta.id) }

    conda (params.enable_conda ? "bioconda::fgbio=1.3.0" : null)
    if (workflow.containerEngine == 'singularity' && !params.singularity_pull_docker_container) {
        container "https://depot.galaxyproject.org/singularity/fgbio:1.3.0--0"
    } else {
        container "quay.io/biocontainers/fgbio:1.3.0--0"
    }

    input:
    tuple val(meta), path(reads)
    val(read_structure)

    output:
    tuple val(meta), path("*_umi_converted.bam"), emit: umibam
    path "*.version.txt"          , emit: version

    script:
    def software = getSoftwareName(task.process)
    def prefix   = options.suffix ? "${meta.id}${options.suffix}" : "${meta.id}"

    """
    mkdir tmpFolder

    fgbio --tmp-dir=${PWD}/tmpFolder \\
    FastqToBam \\
    -i ${reads} \\
    -o "${prefix}_umi_converted.bam" \\
    --read-structures $read_structure \\
    --sample ${meta.id} \\
    --library ${meta.id} ${options.args}

    echo $VERSION >${software}.version.txt
    """
}
```

Note that we have commented our choice to deviate from the guidelines in order to output the software version, so any users will be aware of the reasons for this code.

> :heavy_check_mark: It is always good practice to commit regularly while you write the code and comment the commit with a meaningful message. This way, you will always be able to revert the changes at any time.

### Lint your code

Now that you've completed code development, you are ready to check if your code is clean and up to standards.

This can also be done easily using _nf-core tools_ just by changing folder into the parent _modules_ directory and typing the command

```bash
nf-core modules lint fgbio/fastqtobam -d .
```

You will expect no test failed, as shown in figure below:

![lint](/assets/markdown_assets/contributing/dsl2_modules_tutorial/dsl2-mod_04_lint_module.png)

For more information on fixing linting errors in your code both locally and directly in your pull request in GitHub, check at the end of this subsection [here](https://nf-co.re/docs/usage/tutorials/nf_core_usage_tutorial#installing-the-nf-core-helper-tools).

## Test your code

Once your code is polished, following any suggestions from linting, you should test the code and make sure everything works as expected.
This can also be done automatically, using the [pytest-workflow](https://pytest-workflow.readthedocs.io/en/stable/) tool.

### Create a test workflow

As described above, _nf-core tools_ has created already the following files

```bash
tests/modules/fgbio
└── fastqtobam
    ├── main.nf
    └── test.yml
```

ready for you to modify.

You should first open `tests/modules/fgbio/fastqtobam/main.nf` and create a short test workflow, with available test data.

> :soon: this example is using available test data, chosen for Sarek functionalities. It will be updated according to the new [scheme](https://github.com/nf-core/modules/blob/master/tests/config/test_data.config)

In our test workflow we have to define the two mandatory inputs.
We know the test data is using QIAseq library preparation, and therefore we use the following read structure string

```nextflow
params.read_structure = "+T 12M11S+T"
```

Then we prepare our input tuple, to point to the correct test data

```nextflow
def input = []
    input = [ [id: 'test'], //meta map
                  [ file('https://raw.githubusercontent.com/nf-core/test-datasets/sarek/testdata/umi-dna/qiaseq/SRR7545951-small_1.fastq.gz'), file('https://raw.githubusercontent.com/nf-core/test-datasets/sarek/testdata/umi-dna/qiaseq/SRR7545951-small_2.fastq.gz') ] ]
```

Our test workflow will be very simple, and most of the code has been written by nf-core tools already. It will look like this

```nextflow
#!/usr/bin/env nextflow

nextflow.enable.dsl = 2
params.read_structure = "+T 12M11S+T"

include { FGBIO_FASTQTOBAM } from '../../../../modules/fgbio/fastqtobam/main.nf' addParams( options: [args: ''] )

workflow test_fgbio_fastqtobam {

    def input = []
    input = [ [id: 'test'], //meta map
                  [ file('https://raw.githubusercontent.com/nf-core/test-datasets/sarek/testdata/umi-dna/qiaseq/SRR7545951-small_1.fastq.gz'), file('https://raw.githubusercontent.com/nf-core/test-datasets/sarek/testdata/umi-dna/qiaseq/SRR7545951-small_2.fastq.gz') ] ]

    FGBIO_FASTQTOBAM ( input, "${params.read_structure}" )
}
```

### Create test YAML

In order to carry out the test, _pytest-workflow_ will search for information stored in 2 files.

```bash
modules/tests/config/pytest_software.yml
modules/tests/software/fgbio/fastqtobam/test.yml
```

We can modify these files using _nf-core tools_, moving into the parent modules directory and using a simple command:

```bash
nf-core modules create-test-yml -t fgbio/fastqtobam
```

The tool will prompt us to make sure we want to overwrite the existing .yml file, and we can choose _yes_. We can leave defaults for entry points, test name and command.

We are then prompted for the software profile, and we have to choose between _Conda_, _Docker_ or _Singularity_, i.e. the three conteinerised solution included in the module `main.nf`.

In the example below we have chosen Conda.

![create_yaml](/assets/markdown_assets/contributing/dsl2_modules_tutorial/dsl2-mod_05_create_test_yaml.png)

This process will run the test workflow, generate the outputs and update the `test.yml` file accordingly.

### Check pytest YAML

Before running some local tests, we should make sure the `pytest_software.yml` looks like we expect, i.e. contains the following lines

```yaml
fgbio_fastqtobam:
  - modules/fgbio/fastqtobam/**
  - tests/modules/fgbio/fastqtobam/**
```

These lines will instruct the pre-configure GitHub Action workflow to run a pytest-workflow run also for our module, using the code stored at `modules/fgbio/fastqtobam/**` and the test at `tests/modules/fgbio/fastqtobam/**`.

### Run tests locally

Now we are ready to run some tests using _pytest-workflow_ in order to anticipate what will happen with :octocat: actions.

We will follow the instructions on _nf-core_ [modules repository](https://github.com/nf-core/modules#running-tests-manually).

Pytest-workflow will be launched using the tags specified in the `test.yml` we have just modified:

```yaml
tags:
  - fgbio_fastqtobam
  - fgbio
```

We will run one or more of the following, depending on the software profile available on our development environment:

```bash
cd /path/to/git/clone/of/nf-core/modules/
PROFILE=docker pytest --tag fgbio_bamtofastq --symlink --keep-workflow-wd

```

or if we use _singularity_

```bash
cd /path/to/git/clone/of/nf-core/modules/
TMPDIR=~ PROFILE=singularity pytest --tag fgbio_bamtofastq --symlink --keep-workflow-wd
```

or _Conda_

```bash
cd /path/to/git/clone/of/nf-core/modules/
PROFILE=conda pytest --tag fgbio_bamtofastq --symlink --keep-workflow-wd
```

Hopefully everything runs smoothly, and we are then ready to open a pull request, and contribute to the nf-core community.

To save you having to install `pytest-workflow` separately it was added as a dependency for nf-core/tools (`>= 1.13.2`). However, if you find that you don't have a `pytest` command in your nf-core environment, or you're notified there's no `--symlinks` option, you could try and install a later version of nf-core/tools to see if that works instead.

The minimum Nextflow version required to run the tests can be found in [this `nextflow.config` file](https://github.com/nf-core/modules/blob/d63ff4ba1b08cd0dc05c375efa69885297de7507/tests/config/nextflow.config#L28) in the nf-core/modules repository. If the version of Nextflow you are using is older than the version specified there you may get an error such as `Nextflow version 20.10.0 does not match workflow required version: >=20.11.0-edge`. The error will be reported in `log.err` in the directory where the outputs from the tests were generated. See the Nextflow [releases](https://github.com/nextflow-io/nextflow/releases) and [installation](https://www.nextflow.io/docs/latest/getstarted.html#installation) pages to install a later version.

```bash
NXF_VER="21.04.0-edge" PROFILE=docker pytest --tag fgbio_bamtofastq --symlink --keep-workflow-wd
```

## Create a Pull Request

Creating a Pull Request is very simple: on the top right of your repository you can click on the link "Pull request" as shown in the figure below:

![pull](/assets/markdown_assets/contributing/dsl2_modules_tutorial/dsl2-mod_06_pull-reqs.png)

If you have initiated the pull request from your forked repository, the direction of the request should be indicated by the arrow, as in the picture below, i.e. from your fork to the nf-core original repository

![open_pull](/assets/markdown_assets/contributing/dsl2_modules_tutorial/dsl2-mod_07_pull-reqs-open.png)

You can find more information on the GitHub [guide](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/creating-a-pull-request) and the nf-core talk [_Bytesize 4: GitHub contribution basics_](https://nf-co.re/events/2021/bytesize-4-github-contribution-basics).

Make sure you are submitting the newly created branch, where your new module has been developed, into the master branch of nf-core modules.

A pull request will be created: volunteers will review your code and will use comments and requests for changes on GitHub to interact with you and suggest changes if necessary. This is a collaborative and very interesting part of your development work.

Enjoy!
