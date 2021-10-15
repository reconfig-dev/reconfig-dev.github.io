---
slug: vivado-internal-params
title: Use All Tunable Vivado Internal Params
authors: syed
tags: [vivado, fpga, tcl]
---

So I learned about this parameter that can be set in vivado, called `place.debugShape`, for my overlay generation work. It was referred in one of the tcl scripts in RapidWright with the command `set_param place.debugShape $shapesFileName`. Studying the tcl commands guide, I found out, you can list the description of this property using `report_param -non_default`, which suggests `place.debugShape` is an internal knob. A caveat of the report_param command is that, it only lists these internal params when it is changed from its default value (you can know its default value by `get_param`). That is, `report_param -non_default` won't show you all the internal knobs that are in vivado.

Now that you have some context, it got me thinking are there other useful params which we should know about? Looks like somebody asked the same [question](https://forums.xilinx.com/t5/Vivado-TCL-Community/lt-list-param-gt-not-listing-a-lot/td-p/998194) in Xilinx's forum, but received a reply from Xilinx saying those are internal and thou shall not use it.
When using the `place.debugShape` in my scripts, I saw some outputs:

```
Shape builder is called from:
Stack:
/opt/Xilinx/Vivado/2018.3/lib/lnx64.o/librdi_place.so(HAPLPlacerShapeBuilder::buildShapes(HDPLNewShapeDB&, HSTPtrHashSet&, HDPLTask&, HAPLPlaceApi*, HDPLControlSetDB const*,
/opt/Xilinx/Vivado/2018.3/lib/lnx64.o/librdi_implflow.so(HAPLFFastFlow3::place(HAPLFFastFlowParam const&, HAPLFMigPblockInfo const*)+0x12cf) [0x7f51a8e7bb3f]
/opt/Xilinx/Vivado/2018.3/lib/lnx64.o/libtcl8.5.so(+0x334af) [0x7f51ccef74af]
```
which looked like a familiar pattern - a frontend (tcl) binding to a C++ backend. So I was like, ok, may be if I grep the object dump of one of these `.so`, I could get the params? That didn't work. But what did work was, when I treated the `.so` in grep as a text file and searched for a "something-dot-camelCase" pattern, and voila, everything was in plain sight:
```
place.debugCongestion
place.debugCrash
place.debugFFGroup
place.debugLightTimer
place.debugMacroInterleavingOptimization
place.debugShape
place.debugShapeAppend
place.debugWireLen
...
```
And many more such as:
```
logicopt.allowEmptyHierCellNets
logicopt.allowEmptyHierCells
logicopt.allowInverterPushing
logicopt.annotateModifiedPrims
logicopt.applyFinishingTouch
logicopt.applyLogicProp
logicopt.applyPostPwroptCleanup
logicopt.applyRestruct
...
```

Similarly, there are tuneable params that look like `synth.*`, `route.*`, `power.*`, `timing.*`. in their respective `librdi_*.so`. That's all for this post. May be if you have a use-case, where you wanted vivado to do something, but it's not visible, one of these parameters might come into use! Of course I get Xilinx's point about these being internal knobs ;).

FYI following is the command with regex I used:
```
grep -a -o -E '[a-zA-Z0-9]{3,}.[a-z]([a-z0-9][A-Z][A-Z0-9][a-z]|[A-Z0-9][a-z][a-z0-9][A-Z])[a-ZA-Z0-9]{3,}' /opt/Xilinx/Vivado/2018.3/lib/lnx64.o/librdi_place.so
```

You can find about 5000 of the params I scraped, in this repository: https://github.com/syed-ahmed/vivado-hacks 