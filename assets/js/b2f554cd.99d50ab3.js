"use strict";(self.webpackChunkreconfig=self.webpackChunkreconfig||[]).push([[477],{10:function(e){e.exports=JSON.parse('{"blogPosts":[{"id":"yaml-based-vivado-hardware-project","metadata":{"permalink":"/blog/yaml-based-vivado-hardware-project","editUrl":"https://github.com/syed-ahmed/syed-ahmed.github.io/edit/main/reconfig/blog/blog/2020-06-02-yaml-based-vivado-hardware-project/index.md","source":"@site/blog/2020-06-02-yaml-based-vivado-hardware-project/index.md","title":"Creating Vivado Hardware Platform using YAML","description":"The hardware design community have been following a design paradigm where you think of designing hardware spatially, i.e. start with a block diagram. I remember from my undergraduate logic design course, a block diagram was required before we started a lab assignment. It is the right approach for designing hardware. Vivado reinforces this paradigm by asking people to open the Vivado GUI, use the IP integrator and create a block design.","date":"2020-06-02T00:00:00.000Z","formattedDate":"June 2, 2020","tags":[{"label":"vivado","permalink":"/blog/tags/vivado"},{"label":"fpga","permalink":"/blog/tags/fpga"},{"label":"tcl","permalink":"/blog/tags/tcl"},{"label":"yaml","permalink":"/blog/tags/yaml"},{"label":"hydra","permalink":"/blog/tags/hydra"}],"readingTime":5.59,"truncated":true,"authors":[{"name":"Syed Tousif Ahmed","title":"PhD Student, IC Group, UPenn","url":"https://syed-ahmed.github.io","imageURL":"https://syed-ahmed.github.io/images/profile-pic1.jpg","key":"syed"}],"nextItem":{"title":"Use All Tunable Vivado Internal Params","permalink":"/blog/vivado-internal-params"}},"content":"The hardware design community have been following a design paradigm where you think of designing hardware spatially, i.e. start with a block diagram. I remember from my undergraduate logic design course, a block diagram was required before we started a lab assignment. It is the right approach for designing hardware. Vivado reinforces this paradigm by asking people to open the Vivado GUI, use the IP integrator and create a block design. \x3c!--truncate--\x3e\\n\\nAn alternative to the GUI are the Vivado TCL commands. <img style={{float: \'right\', height: 1000}} src={require(\'./assets/flow.png\').default}/>TCL is the scripting language of the hardware design community. If you wanted to generate block designs based on some input parameters, you would be using TCL. If you are developing on a headless server, you would have no other choice than to use TCL.\\nTCL programming is not bad, however, I\'m very used to Python as my scripting language of choice. If you wanted to generate a block design that was data driven (for instance, use the decisions made by a PyTorch ML model or a Google OR-Tools model), you would need to introduce Python into the picture because TCL doesn\'t have such packages.\\nIf Python was a front-end for Vivado, our problem would have been solved! So how do we go from Python to TCL? People follow different approaches. You could write a Python script that generates a TCL file with the desired commands and parameters. You could use [elmer](http://elmer.sourceforge.net/examples.html) to call Python from TCL (for instance, fork into a python class, get values from it and feed it to your TCL command), but elmer doesn\'t work for Python3. While writing this post, I came to know about Olof Kindgren\'s [edalize](https://github.com/olofk/edalize) project! I\'m taking a similar approach to this project, i.e. have a templated TCL script and use Python to feed those template parameters.\\nI generate a `yaml` configuration file from python and parse it in a TCL script. TCL has a yaml parser and can parse it to a TCL dictionary. You can then use the values from the dictionary in generic TCL functions. I discovered this [repository](https://github.com/Xilinx/wireless-apps/tree/master/scripts) from Xilinx which uses a yaml configuration file in a TCL script to generate a vivado project. In addition, I found this excellent [Vivado hardware platform project](https://github.com/Xilinx/Vitis-AI/tree/master/DPU-TRD/prj/Vivado/scripts) from Xilinx that uses TCL dicts to fully parameterize the generation of a block design. Combining these two, I have the approach on the right hand side.\\n\\nConsider the following `yaml` file for one of our projects:\\n\\n```\\ndict_prj:\\n  dict_sys:\\n    bd_name: floorplan_static\\n    bd_ooc: Hierarchical\\n    prj_board: em.avnet.com:ultra96v2:part0:1.0\\n    prj_name: floorplan_static\\n    prj_part: xczu3eg-sbva484-1-e\\n  dict_stgy:\\n    synth:\\n      synth_1:\\n        STRATEGY: \\"\\"\\n        JOBS: 40\\n    impl:\\n      impl_1_01:\\n        PARENT: \\"\\"\\n        STRATEGY: \\"\\"\\n        JOBS: 40\\n      impl_1_03:\\n        PARENT: \\"\\"\\n        STRATEGY: \\"\\"\\n        JOBS: 40\\n      impl_1_14:\\n        PARENT: \\"\\"\\n        STRATEGY: \\"\\"\\n        JOBS: 40\\n      impl_1_15:\\n        PARENT: \\"\\"\\n        STRATEGY: \\"\\"\\n        JOBS: 40\\n  dict_xdc:\\n    -\\n      NAME: pblocks.xdc\\n      IS_TARGET: True\\n  dict_src:\\n    -\\n      NAME: AxiLite2Bft_v2_0.v\\n    -\\n      NAME: converter.v\\n      ...\\n  dict_hier:\\n    h_bft:\\n      PATH: bft\\n  dict_ip:\\n    ip_ps:\\n      PATH: zynq_ultra_ps_e_0\\n      NAME: zynq_ultra_ps_e\\n      VLNV: \\"\\"\\n      PROP:\\n        PSU__CRL_APB__PL1_REF_CTRL__ACT_FREQMHZ: \\"19.660831\\"\\n        PSU__FPGA_PL1_ENABLE: \\"1\\"\\n        PSU__CRL_APB__PL1_REF_CTRL__SRCSEL: RPLL\\n        PSU__PL_CLK1_BUF: \\"TRUE\\"\\n        PSU__SAXIGP2__DATA_WIDTH: \\"32\\"\\n        PSU__USE__S_AXI_GP2: 1\\n      BACFG:\\n        apply_board_preset: 1\\n    ip_clk_rst_usr:\\n      PATH: rst_ps8_0_100M\\n      NAME: proc_sys_reset\\n      VLNV: \\"\\"\\n      PROP: \\"\\"\\n      BACFG: \\"\\"\\n      ...\\n  dict_pin:\\n    p_bft_S00_AXI:\\n      CLASS: INTF_PIN\\n      PATH: \\"bft/S00_AXI\\"\\n      MODE: Slave\\n      VLNV: \\"xilinx.com:interface:aximm_rtl:1.0\\"\\n      ...\\n  dict_cn:\\n    cn_overlay:\\n      PIN intf PIN:\\n        zynq_ultra_ps_e_0/S_AXI_HP0_FPD: bft/M00_AXI\\n        zynq_ultra_ps_e_0/M_AXI_HPM0_FPD: bft/S00_AXI\\n        zynq_ultra_ps_e_0/M_AXI_HPM1_FPD: bft/S01_AXI\\n        ...\\n      PIN from PIN:\\n        bft/bft_0/dout_leaf_0: bft/AxiLite2Bft_v2_0_0/host_interface2bft\\n        bft/leaf_interface_0/din_leaf_user2interface: bft/axi_dma_0/m_axis_mm2s_tdata\\n        bft/leaf_interface_0/vld_user2interface: bft/axi_dma_0/m_axis_mm2s_tvalid\\n        bft/xlconcat_0/In0: bft/axi_dma_0/mm2s_introut\\n        bft/xlconcat_0/In1: bft/axi_dma_1/s2mm_introut\\n        ...\\n  dict_addr:\\n    addr_s00_axi:\\n      REG: bft/AxiLite2Bft_v2_0_0/s00_axi/reg0\\n      RANGE: 0x00001000\\n      OFFSET: 0xA0002000\\n    ...\\n```\\n\\n\\nYou can see that we have parameterized part and board numbers, since we want to support multiple boards with the same design. The PS IP is also parameterized since we want to support Zynq 7 series and Zynq UltraScale+. Similarly, you can see synthesis and implementation strategies are now parameterized, which means more design space exploration! Even connections of pins - we can now configure that with a python script if we want to generate a different overlay.\\n\\nFollowing is how we are parsing the yaml in the TCL script:\\n\\n```\\n#****************************************************************\\n# check if file exists\\n#****************************************************************\\nproc lib_check_file { file_name } {\\n    set file_content \\"\\"\\n    if { [ file exists  $file_name ] } {\\n        set fp [open $file_name r]\\n        set file_content [read $fp]\\n        close $fp\\n    } else {\\n        lib_error YAML \\"Cannot open filename $file_name...\\"\\n    }\\n    return $file_content\\n}\\n\\n#****************************************************************\\n# load yaml file into dict\\n#****************************************************************\\nproc lib_yaml2dict { file_name } {\\n    set file_content [ lib_check_file $file_name ]\\n    return [yaml::yaml2dict $file_content]\\n}\\n\\n#****************************************************************\\n# set global dict_prj\\n#****************************************************************\\nset dict_prj  {}\\n\\nset config_file \\"config.yaml\\"\\nset cfg [lib_yaml2dict $config_file]\\nset dict_prj [dict get $cfg dict_prj]\\n```\\n\\nThe rest of the script is then from [Xilinx\'s Vitis-AI repository](https://github.com/Xilinx/Vitis-AI/tree/master/DPU-TRD/prj/Vivado/scripts). \\nNow if you are wondering, why YAML? It\'s solely because of [hydra](https://hydra.cc/). Hydra\'s ability to compose a yaml file from a hierarchy of yaml files is a stunning feature that lets me focus on the parameters that matter in my project, and exactly fits our use case of supporting multiple moving things. For instance, Vivado is not backwards compatible and a set of parameters that worked in `2018.3` might not work in `2019.2`, for each board, Zynq7 and Zynq UltraScale+ PS parameters are different, and so on. Following is what my hydra conf looks like:\\n```\\n\u251c\u2500\u2500 conf\\n\u2502   \u251c\u2500\u2500 architecture\\n|   \u251c\u2500\u2500 board\\n|       \u251c\u2500\u2500 pynq_z1.yaml\\n|       \u251c\u2500\u2500 ultra96v2.yaml\\n|       \u251c\u2500\u2500 zcu102.yaml\\n|       \u251c\u2500\u2500 zed.yaml\\n\u2502   \u251c\u2500\u2500 vivado\\n|       \u251c\u2500\u2500 2018.3\\n|           \u251c\u2500\u2500 ultra96v2.yaml\\n|           \u251c\u2500\u2500 zcu102.yaml\\n|       \u251c\u2500\u2500 2019.2\\n|           \u251c\u2500\u2500 zed.yaml\\n|   \u251c\u2500\u2500 config.yaml\\n\u2514\u2500\u2500 generate_vivado_project.py\\n```\\nI can then execute the `generate_vivado_project.py` script with the command line parameters, such as `board=zed.yaml`, `vivado=2019.2` and it will generate a `config.yaml` which is the composition of the yaml files from the respective `conf` subdirectories. And now you can just source the tcl file with this config file! As a result, block design in vivado becomes a matter of writing a `yaml` file. \\n\\nNow some cons of this approach - I have to find the names of the parameters, such as the Zynq IP parameters, AXI DMA parameters by trial-error in the GUI and then note it down in my configuration. This could be easily mitigated if all these parameters are nicely documented somewhere (or alternatively you could actually finish the design in GUI, export the TCL file and then note down the parameters from that TCL file...). Moreover, I like connecting the input and output of a block in the GUI than manually writing it in the `yaml` file. Hence, the way I see it, if you are prototyping and playing around with ideas, GUI approach is more flexible as I\'m able to see the design like I would have done in my logic design lab assignments, whereas, when doing automation around generating hardware, templated TCL scripts with a configuration file is the way to go :)."},{"id":"vivado-internal-params","metadata":{"permalink":"/blog/vivado-internal-params","editUrl":"https://github.com/syed-ahmed/syed-ahmed.github.io/edit/main/reconfig/blog/blog/2020-03-31-use-all-tunable-vivado-internal-params/index.md","source":"@site/blog/2020-03-31-use-all-tunable-vivado-internal-params/index.md","title":"Use All Tunable Vivado Internal Params","description":"So I learned about this parameter that can be set in vivado, called place.debugShape, for my overlay generation work. It was referred in one of the tcl scripts in RapidWright with the command setparam place.debugShape $shapesFileName. Studying the tcl commands guide, I found out, you can list the description of this property using reportparam -nondefault, which suggests place.debugShape is an internal knob. A caveat of the reportparam command is that, it only lists these internal params when it is changed from its default value (you can know its default value by getparam). That is, reportparam -non_default won\'t show you all the internal knobs that are in vivado.","date":"2020-03-31T00:00:00.000Z","formattedDate":"March 31, 2020","tags":[{"label":"vivado","permalink":"/blog/tags/vivado"},{"label":"fpga","permalink":"/blog/tags/fpga"},{"label":"tcl","permalink":"/blog/tags/tcl"}],"readingTime":1.865,"truncated":true,"authors":[{"name":"Syed Tousif Ahmed","title":"PhD Student, IC Group, UPenn","url":"https://syed-ahmed.github.io","imageURL":"https://syed-ahmed.github.io/images/profile-pic1.jpg","key":"syed"}],"prevItem":{"title":"Creating Vivado Hardware Platform using YAML","permalink":"/blog/yaml-based-vivado-hardware-project"}},"content":"So I learned about this parameter that can be set in vivado, called `place.debugShape`, for my overlay generation work. It was referred in one of the tcl scripts in RapidWright with the command `set_param place.debugShape $shapesFileName`. Studying the tcl commands guide, I found out, you can list the description of this property using `report_param -non_default`, which suggests `place.debugShape` is an internal knob. A caveat of the report_param command is that, it only lists these internal params when it is changed from its default value (you can know its default value by `get_param`). That is, `report_param -non_default` won\'t show you all the internal knobs that are in vivado. \x3c!--truncate--\x3e\\n\\nNow that you have some context, it got me thinking are there other useful params which we should know about? Looks like somebody asked the same [question](https://forums.xilinx.com/t5/Vivado-TCL-Community/lt-list-param-gt-not-listing-a-lot/td-p/998194) in Xilinx\'s forum, but received a reply from Xilinx saying those are internal and thou shall not use it.\\nWhen using the `place.debugShape` in my scripts, I saw some outputs:\\n\\n```\\nShape builder is called from:\\nStack:\\n/opt/Xilinx/Vivado/2018.3/lib/lnx64.o/librdi_place.so(HAPLPlacerShapeBuilder::buildShapes(HDPLNewShapeDB&, HSTPtrHashSet&, HDPLTask&, HAPLPlaceApi*, HDPLControlSetDB const*,\\n/opt/Xilinx/Vivado/2018.3/lib/lnx64.o/librdi_implflow.so(HAPLFFastFlow3::place(HAPLFFastFlowParam const&, HAPLFMigPblockInfo const*)+0x12cf) [0x7f51a8e7bb3f]\\n/opt/Xilinx/Vivado/2018.3/lib/lnx64.o/libtcl8.5.so(+0x334af) [0x7f51ccef74af]\\n```\\nwhich looked like a familiar pattern - a frontend (tcl) binding to a C++ backend. So I was like, ok, may be if I grep the object dump of one of these `.so`, I could get the params? That didn\'t work. But what did work was, when I treated the `.so` in grep as a text file and searched for a \\"something-dot-camelCase\\" pattern, and voila, everything was in plain sight:\\n```\\nplace.debugCongestion\\nplace.debugCrash\\nplace.debugFFGroup\\nplace.debugLightTimer\\nplace.debugMacroInterleavingOptimization\\nplace.debugShape\\nplace.debugShapeAppend\\nplace.debugWireLen\\n...\\n```\\nAnd many more such as:\\n```\\nlogicopt.allowEmptyHierCellNets\\nlogicopt.allowEmptyHierCells\\nlogicopt.allowInverterPushing\\nlogicopt.annotateModifiedPrims\\nlogicopt.applyFinishingTouch\\nlogicopt.applyLogicProp\\nlogicopt.applyPostPwroptCleanup\\nlogicopt.applyRestruct\\n...\\n```\\n\\nSimilarly, there are tuneable params that look like `synth.*`, `route.*`, `power.*`, `timing.*`. in their respective `librdi_*.so`. That\'s all for this post. May be if you have a use-case, where you wanted vivado to do something, but it\'s not visible, one of these parameters might come into use! Of course I get Xilinx\'s point about these being internal knobs ;).\\n\\nFYI following is the command with regex I used:\\n```\\ngrep -a -o -E \'[a-zA-Z0-9]{3,}.[a-z]([a-z0-9][A-Z][A-Z0-9][a-z]|[A-Z0-9][a-z][a-z0-9][A-Z])[a-ZA-Z0-9]{3,}\' /opt/Xilinx/Vivado/2018.3/lib/lnx64.o/librdi_place.so\\n```\\n\\nYou can find about 5000 of the params I scraped, in this repository: https://github.com/syed-ahmed/vivado-hacks"}]}')}}]);