const colors = {
  pearl: ['#f4eff9', '#d8dff3'], lavender: ['#d8bfef', '#a883cb'],
  pink: ['#ffc0de', '#ec86b8'], blue: ['#b4edfc', '#6ec5e4'],
  yellow: ['#fff3aa', '#e7c657'], mint: ['#c9f4e0', '#7ecfb8'],
};

// The picture and the tappable targets are composed from this one scene.
const regions = [
  {name:'rainbow-pink', color:'pink', stroke:43, radius:20, path:'M675 157 C804 -6 1010 9 1117 228'},
  {name:'rainbow-yellow', color:'yellow', stroke:42, radius:19, path:'M724 162 C834 48 989 65 1073 236'},
  {name:'rainbow-mint', color:'mint', stroke:40, radius:18, path:'M763 181 C852 96 974 115 1031 249'},
  {name:'rainbow-blue', color:'blue', stroke:40, radius:18, path:'M801 208 C878 145 968 167 987 272'},
  {name:'left-cloud', color:'pearl', radius:22, path:'M672 200 C668 160 723 152 741 181 C771 159 807 186 802 215 C840 226 821 270 791 274 C757 308 723 283 709 267 C673 278 651 247 672 200 Z'},
  {name:'right-cloud', color:'pearl', radius:23, path:'M949 304 C946 264 989 246 1010 264 C1032 227 1068 231 1088 259 C1112 232 1157 248 1160 281 C1209 278 1224 320 1197 344 C1194 384 1150 397 1127 373 C1099 409 1053 403 1043 378 C997 413 967 389 970 357 C939 356 925 325 949 304 Z'},
  {name:'tail-pink', color:'pink', stroke:112, radius:23, path:'M906 791 C1055 694 1174 765 1148 875 C1136 932 1102 960 1134 1008'},
  {name:'tail-lavender', color:'lavender', stroke:111, radius:23, path:'M879 862 C985 807 1012 884 966 963 C915 1051 976 1143 1067 1158 C1152 1173 1210 1115 1169 1067'},
  {name:'tail-blue', color:'blue', stroke:61, radius:24, path:'M913 826 C1050 786 1093 865 1039 948 C992 1022 1000 1074 1045 1092'},
  {name:'tail-yellow', color:'yellow', stroke:50, radius:22, path:'M1066 994 C1024 1073 1090 1121 1144 1094'},
  {name:'body', color:'pearl', rim:'lavender', radius:20, path:'M427 755 C509 721 596 750 653 777 C721 777 801 793 844 832 C900 888 919 994 874 1106 C864 1136 837 1152 790 1162 L682 1199 L567 1183 L506 1110 L438 1130 L349 1101 C335 1031 352 962 386 897 Z'},
  {name:'rear-leg', color:'pearl', rim:'lavender', radius:20, path:'M270 907 C227 915 152 956 121 1017 C89 1079 85 1128 122 1151 C156 1174 216 1163 232 1129 L280 1050 L339 998 Z'},
  {name:'front-leg', color:'pearl', rim:'lavender', radius:20, path:'M363 897 C305 920 284 991 263 1057 C236 1121 239 1188 284 1202 C322 1216 379 1202 397 1172 L443 1073 L477 984 Z'},
  {name:'front-hoof', color:'lavender', gold:true, radius:22, path:'M258 1097 C296 1092 363 1107 406 1137 L391 1178 C363 1220 264 1226 250 1180 Z'},
  {name:'rear-hoof', color:'lavender', gold:true, radius:21, path:'M106 1046 C151 1040 210 1059 242 1090 L228 1136 C196 1179 94 1176 90 1129 Z'},
  {name:'body-hoof', color:'lavender', gold:true, radius:21, path:'M568 1081 C623 1099 668 1141 678 1196 C634 1224 574 1225 542 1197 C499 1162 512 1109 568 1081 Z'},
  {name:'mane-top', color:'lavender', stroke:110, radius:21, path:'M543 198 C481 91 402 177 372 254 C325 346 253 453 154 397 C113 372 150 342 181 356'},
  {name:'mane-pink', color:'pink', stroke:62, radius:23, path:'M528 181 C463 120 422 222 389 283 C332 399 271 440 230 409'},
  {name:'mane-blue', color:'blue', stroke:44, radius:19, path:'M521 224 C452 177 425 262 389 309 C332 377 240 394 170 372'},
  {name:'head', color:'pearl', rim:'lavender', radius:19, path:'M203 435 C179 394 163 324 169 231 C164 173 207 170 251 210 L339 284 C395 298 449 306 501 329 C513 252 570 184 638 169 C675 155 704 218 707 277 L707 359 C755 412 756 497 716 556 L651 639 C592 731 482 745 369 727 L221 696 C137 679 112 638 129 574 C137 523 174 483 203 435 Z'},
  {name:'ear-pink', color:'pink', radius:14, path:'M202 234 C215 228 252 262 275 300 L235 349 C215 334 197 284 202 234 Z'},
  {name:'ear-right-pink', color:'pink', radius:17, path:'M639 228 C663 255 674 308 652 354 L592 395 L574 371 C579 317 606 255 639 228 Z'},
  {name:'cheek-left', color:'pink', radius:17, path:'M150 573 C173 545 216 553 237 579 C253 611 216 631 184 628 C159 623 141 600 150 573 Z'},
  {name:'cheek-right', color:'pink', radius:17, path:'M491 627 C518 605 553 610 573 632 C586 656 555 677 523 677 C496 676 479 651 491 627 Z'},
  {name:'mane-side-base', color:'lavender', stroke:110, radius:21, path:'M728 347 C834 389 842 486 791 567 C750 637 707 698 674 756 C661 786 696 803 726 774'},
  {name:'mane-side-pink', color:'pink', stroke:56, radius:23, path:'M741 400 C783 441 776 494 739 549 C697 616 637 680 618 737 C597 778 625 823 658 822'},
  {name:'mane-side-yellow', color:'yellow', stroke:43, radius:19, path:'M760 433 C787 490 728 550 704 601 C684 641 646 675 650 694'},
  {name:'mane-side-blue', color:'blue', stroke:47, radius:21, path:'M798 452 C822 497 782 558 752 600 C725 644 676 692 680 726'},
  {name:'wing', color:'pearl', gold:true, radius:20, path:'M748 764 C764 657 847 586 976 535 Q1043 503 1044 556 C1041 593 1010 623 979 638 Q1039 613 1021 658 C1004 705 952 723 921 731 Q973 721 953 756 C922 804 845 805 748 782 Z'},
];

export { colors, regions };
