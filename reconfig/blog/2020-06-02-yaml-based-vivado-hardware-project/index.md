---
slug: yaml-based-vivado-hardware-project
title: Creating Vivado Hardware Platform using YAML
authors: syed
tags: [vivado, fpga, tcl, yaml, hydra]
---
import Image from '@theme/IdealImage';

The hardware design community have been following a design paradigm where you think of designing hardware spatially, i.e. start with a block diagram. I remember from my undergraduate logic design course, a block diagram was required before we started a lab assignment. It is the right approach for designing hardware. Vivado reinforces this paradigm by asking people to open the Vivado GUI, use the IP integrator and create a block design. <!--truncate-->

An alternative to the GUI are the Vivado TCL commands. <Image style={{height: 1000, float: 'right'}} img={require('./assets/flow.png')} /> TCL is the scripting language of the hardware design community. If you wanted to generate block designs based on some input parameters, you would be using TCL. If you are developing on a headless server, you would have no other choice than to use TCL.
TCL programming is not bad, however, I'm very used to Python as my scripting language of choice. If you wanted to generate a block design that was data driven (for instance, use the decisions made by a PyTorch ML model or a Google OR-Tools model), you would need to introduce Python into the picture because TCL doesn't have such packages.
If Python was a front-end for Vivado, our problem would have been solved! So how do we go from Python to TCL? People follow different approaches. You could write a Python script that generates a TCL file with the desired commands and parameters. You could use [elmer](http://elmer.sourceforge.net/examples.html) to call Python from TCL (for instance, fork into a python class, get values from it and feed it to your TCL command), but elmer doesn't work for Python3. While writing this post, I came to know about Olof Kindgren's [edalize](https://github.com/olofk/edalize) project! I'm taking a similar approach to this project, i.e. have a templated TCL script and use Python to feed those template parameters.
I generate a `yaml` configuration file from python and parse it in a TCL script. TCL has a yaml parser and can parse it to a TCL dictionary. You can then use the values from the dictionary in generic TCL functions. I discovered this [repository](https://github.com/Xilinx/wireless-apps/tree/master/scripts) from Xilinx which uses a yaml configuration file in a TCL script to generate a vivado project. In addition, I found this excellent [Vivado hardware platform project](https://github.com/Xilinx/Vitis-AI/tree/master/DPU-TRD/prj/Vivado/scripts) from Xilinx that uses TCL dicts to fully parameterize the generation of a block design. Combining these two, I have the approach on the right hand side.

Consider the following `yaml` file for one of our projects:

```
dict_prj:
  dict_sys:
    bd_name: floorplan_static
    bd_ooc: Hierarchical
    prj_board: em.avnet.com:ultra96v2:part0:1.0
    prj_name: floorplan_static
    prj_part: xczu3eg-sbva484-1-e
  dict_stgy:
    synth:
      synth_1:
        STRATEGY: ""
        JOBS: 40
    impl:
      impl_1_01:
        PARENT: ""
        STRATEGY: ""
        JOBS: 40
      impl_1_03:
        PARENT: ""
        STRATEGY: ""
        JOBS: 40
      impl_1_14:
        PARENT: ""
        STRATEGY: ""
        JOBS: 40
      impl_1_15:
        PARENT: ""
        STRATEGY: ""
        JOBS: 40
  dict_xdc:
    -
      NAME: pblocks.xdc
      IS_TARGET: True
  dict_src:
    -
      NAME: AxiLite2Bft_v2_0.v
    -
      NAME: converter.v
      ...
  dict_hier:
    h_bft:
      PATH: bft
  dict_ip:
    ip_ps:
      PATH: zynq_ultra_ps_e_0
      NAME: zynq_ultra_ps_e
      VLNV: ""
      PROP:
        PSU__CRL_APB__PL1_REF_CTRL__ACT_FREQMHZ: "19.660831"
        PSU__FPGA_PL1_ENABLE: "1"
        PSU__CRL_APB__PL1_REF_CTRL__SRCSEL: RPLL
        PSU__PL_CLK1_BUF: "TRUE"
        PSU__SAXIGP2__DATA_WIDTH: "32"
        PSU__USE__S_AXI_GP2: 1
      BACFG:
        apply_board_preset: 1
    ip_clk_rst_usr:
      PATH: rst_ps8_0_100M
      NAME: proc_sys_reset
      VLNV: ""
      PROP: ""
      BACFG: ""
      ...
  dict_pin:
    p_bft_S00_AXI:
      CLASS: INTF_PIN
      PATH: "bft/S00_AXI"
      MODE: Slave
      VLNV: "xilinx.com:interface:aximm_rtl:1.0"
      ...
  dict_cn:
    cn_overlay:
      PIN intf PIN:
        zynq_ultra_ps_e_0/S_AXI_HP0_FPD: bft/M00_AXI
        zynq_ultra_ps_e_0/M_AXI_HPM0_FPD: bft/S00_AXI
        zynq_ultra_ps_e_0/M_AXI_HPM1_FPD: bft/S01_AXI
        ...
      PIN from PIN:
        bft/bft_0/dout_leaf_0: bft/AxiLite2Bft_v2_0_0/host_interface2bft
        bft/leaf_interface_0/din_leaf_user2interface: bft/axi_dma_0/m_axis_mm2s_tdata
        bft/leaf_interface_0/vld_user2interface: bft/axi_dma_0/m_axis_mm2s_tvalid
        bft/xlconcat_0/In0: bft/axi_dma_0/mm2s_introut
        bft/xlconcat_0/In1: bft/axi_dma_1/s2mm_introut
        ...
  dict_addr:
    addr_s00_axi:
      REG: bft/AxiLite2Bft_v2_0_0/s00_axi/reg0
      RANGE: 0x00001000
      OFFSET: 0xA0002000
    ...
```


You can see that we have parameterized part and board numbers, since we want to support multiple boards with the same design. The PS IP is also parameterized since we want to support Zynq 7 series and Zynq UltraScale+. Similarly, you can see synthesis and implementation strategies are now parameterized, which means more design space exploration! Even connections of pins - we can now configure that with a python script if we want to generate a different overlay.

Following is how we are parsing the yaml in the TCL script:

```
#****************************************************************
# check if file exists
#****************************************************************
proc lib_check_file { file_name } {
    set file_content ""
    if { [ file exists  $file_name ] } {
        set fp [open $file_name r]
        set file_content [read $fp]
        close $fp
    } else {
        lib_error YAML "Cannot open filename $file_name..."
    }
    return $file_content
}

#****************************************************************
# load yaml file into dict
#****************************************************************
proc lib_yaml2dict { file_name } {
    set file_content [ lib_check_file $file_name ]
    return [yaml::yaml2dict $file_content]
}

#****************************************************************
# set global dict_prj
#****************************************************************
set dict_prj  {}

set config_file "config.yaml"
set cfg [lib_yaml2dict $config_file]
set dict_prj [dict get $cfg dict_prj]
```

The rest of the script is then from [Xilinx's Vitis-AI repository](https://github.com/Xilinx/Vitis-AI/tree/master/DPU-TRD/prj/Vivado/scripts). 
Now if you are wondering, why YAML? It's solely because of [hydra](https://hydra.cc/). Hydra's ability to compose a yaml file from a hierarchy of yaml files is a stunning feature that lets me focus on the parameters that matter in my project, and exactly fits our use case of supporting multiple moving things. For instance, Vivado is not backwards compatible and a set of parameters that worked in `2018.3` might not work in `2019.2`, for each board, Zynq7 and Zynq UltraScale+ PS parameters are different, and so on. Following is what my hydra conf looks like:
```
├── conf
│   ├── architecture
|   ├── board
|       ├── pynq_z1.yaml
|       ├── ultra96v2.yaml
|       ├── zcu102.yaml
|       ├── zed.yaml
│   ├── vivado
|       ├── 2018.3
|           ├── ultra96v2.yaml
|           ├── zcu102.yaml
|       ├── 2019.2
|           ├── zed.yaml
|   ├── config.yaml
└── generate_vivado_project.py
```
I can then execute the `generate_vivado_project.py` script with the command line parameters, such as `board=zed.yaml`, `vivado=2019.2` and it will generate a `config.yaml` which is the composition of the yaml files from the respective `conf` subdirectories. And now you can just source the tcl file with this config file! As a result, block design in vivado becomes a matter of writing a `yaml` file. 

Now some cons of this approach - I have to find the names of the parameters, such as the Zynq IP parameters, AXI DMA parameters by trial-error in the GUI and then note it down in my configuration. This could be easily mitigated if all these parameters are nicely documented somewhere (or alternatively you could actually finish the design in GUI, export the TCL file and then note down the parameters from that TCL file...). Moreover, I like connecting the input and output of a block in the GUI than manually writing it in the `yaml` file. Hence, the way I see it, if you are prototyping and playing around with ideas, GUI approach is more flexible as I'm able to see the design like I would have done in my logic design lab assignments, whereas, when doing automation around generating hardware, templated TCL scripts with a configuration file is the way to go :). 