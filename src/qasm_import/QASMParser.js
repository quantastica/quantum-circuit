// Generated from QASM.g4 by ANTLR 4.7.1
// jshint ignore: start
var antlr4 = require('antlr4/index');
var QASMListener = require('./QASMListener').QASMListener;
var grammarFileName = "QASM.g4";

var serializedATN = ["\u0003\u608b\ua72a\u8133\ub9ed\u417c\u3be7\u7786\u5964",
    "\u0003)\u0123\u0004\u0002\t\u0002\u0004\u0003\t\u0003\u0004\u0004\t",
    "\u0004\u0004\u0005\t\u0005\u0004\u0006\t\u0006\u0004\u0007\t\u0007\u0004",
    "\b\t\b\u0004\t\t\t\u0004\n\t\n\u0004\u000b\t\u000b\u0004\f\t\f\u0004",
    "\r\t\r\u0004\u000e\t\u000e\u0004\u000f\t\u000f\u0004\u0010\t\u0010\u0003",
    "\u0002\u0003\u0002\u0007\u0002#\n\u0002\f\u0002\u000e\u0002&\u000b\u0002",
    "\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003",
    "\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003",
    "\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003",
    "\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003",
    "\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003",
    "\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003",
    "\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0005\u0003P\n\u0003",
    "\u0003\u0004\u0003\u0004\u0003\u0004\u0003\u0004\u0003\u0005\u0003\u0005",
    "\u0003\u0005\u0003\u0005\u0003\u0005\u0003\u0005\u0003\u0005\u0003\u0005",
    "\u0003\u0005\u0003\u0005\u0003\u0005\u0003\u0005\u0005\u0005b\n\u0005",
    "\u0003\u0006\u0003\u0006\u0003\u0006\u0003\u0006\u0003\u0006\u0003\u0006",
    "\u0003\u0006\u0003\u0006\u0003\u0006\u0003\u0006\u0003\u0006\u0003\u0006",
    "\u0003\u0006\u0003\u0006\u0003\u0006\u0003\u0006\u0003\u0006\u0003\u0006",
    "\u0003\u0006\u0003\u0006\u0005\u0006x\n\u0006\u0003\u0007\u0003\u0007",
    "\u0003\u0007\u0003\u0007\u0003\u0007\u0006\u0007\u007f\n\u0007\r\u0007",
    "\u000e\u0007\u0080\u0003\b\u0003\b\u0003\b\u0003\b\u0003\b\u0003\b\u0003",
    "\b\u0003\b\u0003\b\u0003\b\u0003\b\u0005\b\u008e\n\b\u0003\t\u0003\t",
    "\u0003\t\u0003\t\u0003\t\u0003\t\u0003\t\u0003\t\u0003\t\u0003\t\u0003",
    "\t\u0003\t\u0003\t\u0003\t\u0003\t\u0003\t\u0003\t\u0003\t\u0003\t\u0003",
    "\t\u0003\t\u0003\t\u0003\t\u0003\t\u0003\t\u0003\t\u0003\t\u0003\t\u0003",
    "\t\u0003\t\u0005\t\u00ae\n\t\u0003\n\u0003\n\u0005\n\u00b2\n\n\u0003",
    "\u000b\u0003\u000b\u0007\u000b\u00b6\n\u000b\f\u000b\u000e\u000b\u00b9",
    "\u000b\u000b\u0003\u000b\u0003\u000b\u0003\f\u0003\f\u0003\f\u0003\f",
    "\u0003\f\u0007\f\u00c2\n\f\f\f\u000e\f\u00c5\u000b\f\u0003\f\u0003\f",
    "\u0003\f\u0003\f\u0003\f\u0003\f\u0007\f\u00cd\n\f\f\f\u000e\f\u00d0",
    "\u000b\f\u0003\f\u0003\f\u0003\f\u0003\f\u0003\f\u0003\f\u0007\f\u00d8",
    "\n\f\f\f\u000e\f\u00db\u000b\f\u0003\f\u0003\f\u0007\f\u00df\n\f\f\f",
    "\u000e\f\u00e2\u000b\f\u0003\f\u0003\f\u0003\f\u0003\f\u0005\f\u00e8",
    "\n\f\u0003\r\u0003\r\u0003\r\u0003\r\u0003\r\u0005\r\u00ef\n\r\u0003",
    "\u000e\u0003\u000e\u0003\u000e\u0007\u000e\u00f4\n\u000e\f\u000e\u000e",
    "\u000e\u00f7\u000b\u000e\u0003\u000e\u0003\u000e\u0003\u000f\u0003\u000f",
    "\u0003\u000f\u0003\u000f\u0003\u000f\u0003\u000f\u0003\u000f\u0003\u000f",
    "\u0003\u000f\u0003\u000f\u0003\u000f\u0003\u000f\u0003\u000f\u0003\u000f",
    "\u0003\u000f\u0003\u000f\u0005\u000f\u010b\n\u000f\u0003\u000f\u0003",
    "\u000f\u0003\u000f\u0003\u000f\u0003\u000f\u0003\u000f\u0003\u000f\u0003",
    "\u000f\u0003\u000f\u0003\u000f\u0003\u000f\u0003\u000f\u0003\u000f\u0003",
    "\u000f\u0003\u000f\u0007\u000f\u011c\n\u000f\f\u000f\u000e\u000f\u011f",
    "\u000b\u000f\u0003\u0010\u0003\u0010\u0003\u0010\u0002\u0003\u001c\u0011",
    "\u0002\u0004\u0006\b\n\f\u000e\u0010\u0012\u0014\u0016\u0018\u001a\u001c",
    "\u001e\u0002\u0003\u0003\u0002\u001e#\u0002\u013c\u0002 \u0003\u0002",
    "\u0002\u0002\u0004O\u0003\u0002\u0002\u0002\u0006Q\u0003\u0002\u0002",
    "\u0002\ba\u0003\u0002\u0002\u0002\nw\u0003\u0002\u0002\u0002\f~\u0003",
    "\u0002\u0002\u0002\u000e\u008d\u0003\u0002\u0002\u0002\u0010\u00ad\u0003",
    "\u0002\u0002\u0002\u0012\u00b1\u0003\u0002\u0002\u0002\u0014\u00b7\u0003",
    "\u0002\u0002\u0002\u0016\u00e7\u0003\u0002\u0002\u0002\u0018\u00ee\u0003",
    "\u0002\u0002\u0002\u001a\u00f5\u0003\u0002\u0002\u0002\u001c\u010a\u0003",
    "\u0002\u0002\u0002\u001e\u0120\u0003\u0002\u0002\u0002 $\u0005\u0006",
    "\u0004\u0002!#\u0005\u0004\u0003\u0002\"!\u0003\u0002\u0002\u0002#&",
    "\u0003\u0002\u0002\u0002$\"\u0003\u0002\u0002\u0002$%\u0003\u0002\u0002",
    "\u0002%\u0003\u0003\u0002\u0002\u0002&$\u0003\u0002\u0002\u0002\'P\u0005",
    "\b\u0005\u0002()\u0005\n\u0006\u0002)*\u0005\f\u0007\u0002*+\u0007\u0003",
    "\u0002\u0002+P\u0003\u0002\u0002\u0002,-\u0005\n\u0006\u0002-.\u0007",
    "\u0003\u0002\u0002.P\u0003\u0002\u0002\u0002/0\u0007\u0004\u0002\u0002",
    "01\u0007$\u0002\u000212\u0005\u0014\u000b\u000223\u0007\u0005\u0002",
    "\u00023P\u0003\u0002\u0002\u000245\u0007\u0004\u0002\u000256\u0007$",
    "\u0002\u000267\u0007\u0006\u0002\u000278\u0007\u0007\u0002\u000289\u0005",
    "\u0014\u000b\u00029:\u0007\u0005\u0002\u0002:P\u0003\u0002\u0002\u0002",
    ";<\u0007\u0004\u0002\u0002<=\u0007$\u0002\u0002=>\u0007\u0006\u0002",
    "\u0002>?\u0005\u0014\u000b\u0002?@\u0007\u0007\u0002\u0002@A\u0005\u0014",
    "\u000b\u0002AB\u0007\u0005\u0002\u0002BP\u0003\u0002\u0002\u0002CP\u0005",
    "\u000e\b\u0002DE\u0007\b\u0002\u0002EF\u0007\u0006\u0002\u0002FG\u0007",
    "$\u0002\u0002GH\u0007\t\u0002\u0002HI\u0007&\u0002\u0002IJ\u0007\u0007",
    "\u0002\u0002JP\u0005\u000e\b\u0002KL\u0007\n\u0002\u0002LM\u0005\u0012",
    "\n\u0002MN\u0007\u0005\u0002\u0002NP\u0003\u0002\u0002\u0002O\'\u0003",
    "\u0002\u0002\u0002O(\u0003\u0002\u0002\u0002O,\u0003\u0002\u0002\u0002",
    "O/\u0003\u0002\u0002\u0002O4\u0003\u0002\u0002\u0002O;\u0003\u0002\u0002",
    "\u0002OC\u0003\u0002\u0002\u0002OD\u0003\u0002\u0002\u0002OK\u0003\u0002",
    "\u0002\u0002P\u0005\u0003\u0002\u0002\u0002QR\u0007\u000b\u0002\u0002",
    "RS\u0007%\u0002\u0002ST\u0007\u0005\u0002\u0002T\u0007\u0003\u0002\u0002",
    "\u0002UV\u0007\f\u0002\u0002VW\u0007$\u0002\u0002WX\u0007\r\u0002\u0002",
    "XY\u0007&\u0002\u0002YZ\u0007\u000e\u0002\u0002Zb\u0007\u0005\u0002",
    "\u0002[\\\u0007\u000f\u0002\u0002\\]\u0007$\u0002\u0002]^\u0007\r\u0002",
    "\u0002^_\u0007&\u0002\u0002_`\u0007\u000e\u0002\u0002`b\u0007\u0005",
    "\u0002\u0002aU\u0003\u0002\u0002\u0002a[\u0003\u0002\u0002\u0002b\t",
    "\u0003\u0002\u0002\u0002cd\u0007\u0010\u0002\u0002de\u0007$\u0002\u0002",
    "ef\u0005\u0014\u000b\u0002fg\u0007\u0011\u0002\u0002gx\u0003\u0002\u0002",
    "\u0002hi\u0007\u0010\u0002\u0002ij\u0007$\u0002\u0002jk\u0007\u0006",
    "\u0002\u0002kl\u0007\u0007\u0002\u0002lm\u0005\u0014\u000b\u0002mn\u0007",
    "\u0011\u0002\u0002nx\u0003\u0002\u0002\u0002op\u0007\u0010\u0002\u0002",
    "pq\u0007$\u0002\u0002qr\u0007\u0006\u0002\u0002rs\u0005\u0014\u000b",
    "\u0002st\u0007\u0007\u0002\u0002tu\u0005\u0014\u000b\u0002uv\u0007\u0011",
    "\u0002\u0002vx\u0003\u0002\u0002\u0002wc\u0003\u0002\u0002\u0002wh\u0003",
    "\u0002\u0002\u0002wo\u0003\u0002\u0002\u0002x\u000b\u0003\u0002\u0002",
    "\u0002y\u007f\u0005\u0010\t\u0002z{\u0007\n\u0002\u0002{|\u0005\u0014",
    "\u000b\u0002|}\u0007\u0005\u0002\u0002}\u007f\u0003\u0002\u0002\u0002",
    "~y\u0003\u0002\u0002\u0002~z\u0003\u0002\u0002\u0002\u007f\u0080\u0003",
    "\u0002\u0002\u0002\u0080~\u0003\u0002\u0002\u0002\u0080\u0081\u0003",
    "\u0002\u0002\u0002\u0081\r\u0003\u0002\u0002\u0002\u0082\u008e\u0005",
    "\u0010\t\u0002\u0083\u0084\u0007\u0012\u0002\u0002\u0084\u0085\u0005",
    "\u0018\r\u0002\u0085\u0086\u0007\u0013\u0002\u0002\u0086\u0087\u0005",
    "\u0018\r\u0002\u0087\u0088\u0007\u0005\u0002\u0002\u0088\u008e\u0003",
    "\u0002\u0002\u0002\u0089\u008a\u0007\u0014\u0002\u0002\u008a\u008b\u0005",
    "\u0018\r\u0002\u008b\u008c\u0007\u0005\u0002\u0002\u008c\u008e\u0003",
    "\u0002\u0002\u0002\u008d\u0082\u0003\u0002\u0002\u0002\u008d\u0083\u0003",
    "\u0002\u0002\u0002\u008d\u0089\u0003\u0002\u0002\u0002\u008e\u000f\u0003",
    "\u0002\u0002\u0002\u008f\u0090\u0007\u0015\u0002\u0002\u0090\u0091\u0007",
    "\u0006\u0002\u0002\u0091\u0092\u0005\u001a\u000e\u0002\u0092\u0093\u0007",
    "\u0007\u0002\u0002\u0093\u0094\u0005\u0018\r\u0002\u0094\u0095\u0007",
    "\u0005\u0002\u0002\u0095\u00ae\u0003\u0002\u0002\u0002\u0096\u0097\u0007",
    "\u0016\u0002\u0002\u0097\u0098\u0005\u0018\r\u0002\u0098\u0099\u0007",
    "\u0017\u0002\u0002\u0099\u009a\u0005\u0018\r\u0002\u009a\u009b\u0007",
    "\u0005\u0002\u0002\u009b\u00ae\u0003\u0002\u0002\u0002\u009c\u009d\u0007",
    "$\u0002\u0002\u009d\u009e\u0005\u0012\n\u0002\u009e\u009f\u0007\u0005",
    "\u0002\u0002\u009f\u00ae\u0003\u0002\u0002\u0002\u00a0\u00a1\u0007$",
    "\u0002\u0002\u00a1\u00a2\u0007\u0006\u0002\u0002\u00a2\u00a3\u0007\u0007",
    "\u0002\u0002\u00a3\u00a4\u0005\u0012\n\u0002\u00a4\u00a5\u0007\u0005",
    "\u0002\u0002\u00a5\u00ae\u0003\u0002\u0002\u0002\u00a6\u00a7\u0007$",
    "\u0002\u0002\u00a7\u00a8\u0007\u0006\u0002\u0002\u00a8\u00a9\u0005\u001a",
    "\u000e\u0002\u00a9\u00aa\u0007\u0007\u0002\u0002\u00aa\u00ab\u0005\u0012",
    "\n\u0002\u00ab\u00ac\u0007\u0005\u0002\u0002\u00ac\u00ae\u0003\u0002",
    "\u0002\u0002\u00ad\u008f\u0003\u0002\u0002\u0002\u00ad\u0096\u0003\u0002",
    "\u0002\u0002\u00ad\u009c\u0003\u0002\u0002\u0002\u00ad\u00a0\u0003\u0002",
    "\u0002\u0002\u00ad\u00a6\u0003\u0002\u0002\u0002\u00ae\u0011\u0003\u0002",
    "\u0002\u0002\u00af\u00b2\u0005\u0014\u000b\u0002\u00b0\u00b2\u0005\u0016",
    "\f\u0002\u00b1\u00af\u0003\u0002\u0002\u0002\u00b1\u00b0\u0003\u0002",
    "\u0002\u0002\u00b2\u0013\u0003\u0002\u0002\u0002\u00b3\u00b4\u0007$",
    "\u0002\u0002\u00b4\u00b6\u0007\u0017\u0002\u0002\u00b5\u00b3\u0003\u0002",
    "\u0002\u0002\u00b6\u00b9\u0003\u0002\u0002\u0002\u00b7\u00b5\u0003\u0002",
    "\u0002\u0002\u00b7\u00b8\u0003\u0002\u0002\u0002\u00b8\u00ba\u0003\u0002",
    "\u0002\u0002\u00b9\u00b7\u0003\u0002\u0002\u0002\u00ba\u00bb\u0007$",
    "\u0002\u0002\u00bb\u0015\u0003\u0002\u0002\u0002\u00bc\u00bd\u0007$",
    "\u0002\u0002\u00bd\u00be\u0007\r\u0002\u0002\u00be\u00bf\u0007&\u0002",
    "\u0002\u00bf\u00c0\u0007\u000e\u0002\u0002\u00c0\u00c2\u0007\u0017\u0002",
    "\u0002\u00c1\u00bc\u0003\u0002\u0002\u0002\u00c2\u00c5\u0003\u0002\u0002",
    "\u0002\u00c3\u00c1\u0003\u0002\u0002\u0002\u00c3\u00c4\u0003\u0002\u0002",
    "\u0002\u00c4\u00c6\u0003\u0002\u0002\u0002\u00c5\u00c3\u0003\u0002\u0002",
    "\u0002\u00c6\u00e8\u0007$\u0002\u0002\u00c7\u00c8\u0007$\u0002\u0002",
    "\u00c8\u00c9\u0007\r\u0002\u0002\u00c9\u00ca\u0007&\u0002\u0002\u00ca",
    "\u00cb\u0007\u000e\u0002\u0002\u00cb\u00cd\u0007\u0017\u0002\u0002\u00cc",
    "\u00c7\u0003\u0002\u0002\u0002\u00cd\u00d0\u0003\u0002\u0002\u0002\u00ce",
    "\u00cc\u0003\u0002\u0002\u0002\u00ce\u00cf\u0003\u0002\u0002\u0002\u00cf",
    "\u00d1\u0003\u0002\u0002\u0002\u00d0\u00ce\u0003\u0002\u0002\u0002\u00d1",
    "\u00d2\u0007$\u0002\u0002\u00d2\u00d3\u0007\r\u0002\u0002\u00d3\u00d4",
    "\u0007&\u0002\u0002\u00d4\u00e8\u0007\u000e\u0002\u0002\u00d5\u00d6",
    "\u0007$\u0002\u0002\u00d6\u00d8\u0007\u0017\u0002\u0002\u00d7\u00d5",
    "\u0003\u0002\u0002\u0002\u00d8\u00db\u0003\u0002\u0002\u0002\u00d9\u00d7",
    "\u0003\u0002\u0002\u0002\u00d9\u00da\u0003\u0002\u0002\u0002\u00da\u00dc",
    "\u0003\u0002\u0002\u0002\u00db\u00d9\u0003\u0002\u0002\u0002\u00dc\u00dd",
    "\u0007$\u0002\u0002\u00dd\u00df\u0007\u0017\u0002\u0002\u00de\u00d9",
    "\u0003\u0002\u0002\u0002\u00df\u00e2\u0003\u0002\u0002\u0002\u00e0\u00de",
    "\u0003\u0002\u0002\u0002\u00e0\u00e1\u0003\u0002\u0002\u0002\u00e1\u00e3",
    "\u0003\u0002\u0002\u0002\u00e2\u00e0\u0003\u0002\u0002\u0002\u00e3\u00e4",
    "\u0007$\u0002\u0002\u00e4\u00e5\u0007\r\u0002\u0002\u00e5\u00e6\u0007",
    "&\u0002\u0002\u00e6\u00e8\u0007\u000e\u0002\u0002\u00e7\u00c3\u0003",
    "\u0002\u0002\u0002\u00e7\u00ce\u0003\u0002\u0002\u0002\u00e7\u00e0\u0003",
    "\u0002\u0002\u0002\u00e8\u0017\u0003\u0002\u0002\u0002\u00e9\u00ef\u0007",
    "$\u0002\u0002\u00ea\u00eb\u0007$\u0002\u0002\u00eb\u00ec\u0007\r\u0002",
    "\u0002\u00ec\u00ed\u0007&\u0002\u0002\u00ed\u00ef\u0007\u000e\u0002",
    "\u0002\u00ee\u00e9\u0003\u0002\u0002\u0002\u00ee\u00ea\u0003\u0002\u0002",
    "\u0002\u00ef\u0019\u0003\u0002\u0002\u0002\u00f0\u00f1\u0005\u001c\u000f",
    "\u0002\u00f1\u00f2\u0007\u0017\u0002\u0002\u00f2\u00f4\u0003\u0002\u0002",
    "\u0002\u00f3\u00f0\u0003\u0002\u0002\u0002\u00f4\u00f7\u0003\u0002\u0002",
    "\u0002\u00f5\u00f3\u0003\u0002\u0002\u0002\u00f5\u00f6\u0003\u0002\u0002",
    "\u0002\u00f6\u00f8\u0003\u0002\u0002\u0002\u00f7\u00f5\u0003\u0002\u0002",
    "\u0002\u00f8\u00f9\u0005\u001c\u000f\u0002\u00f9\u001b\u0003\u0002\u0002",
    "\u0002\u00fa\u00fb\b\u000f\u0001\u0002\u00fb\u010b\u0007%\u0002\u0002",
    "\u00fc\u010b\u0007&\u0002\u0002\u00fd\u010b\u0007\u0018\u0002\u0002",
    "\u00fe\u010b\u0007$\u0002\u0002\u00ff\u0100\u0007\u001a\u0002\u0002",
    "\u0100\u010b\u0005\u001c\u000f\u0006\u0101\u0102\u0007\u0006\u0002\u0002",
    "\u0102\u0103\u0005\u001c\u000f\u0002\u0103\u0104\u0007\u0007\u0002\u0002",
    "\u0104\u010b\u0003\u0002\u0002\u0002\u0105\u0106\u0005\u001e\u0010\u0002",
    "\u0106\u0107\u0007\u0006\u0002\u0002\u0107\u0108\u0005\u001c\u000f\u0002",
    "\u0108\u0109\u0007\u0007\u0002\u0002\u0109\u010b\u0003\u0002\u0002\u0002",
    "\u010a\u00fa\u0003\u0002\u0002\u0002\u010a\u00fc\u0003\u0002\u0002\u0002",
    "\u010a\u00fd\u0003\u0002\u0002\u0002\u010a\u00fe\u0003\u0002\u0002\u0002",
    "\u010a\u00ff\u0003\u0002\u0002\u0002\u010a\u0101\u0003\u0002\u0002\u0002",
    "\u010a\u0105\u0003\u0002\u0002\u0002\u010b\u011d\u0003\u0002\u0002\u0002",
    "\u010c\u010d\f\n\u0002\u0002\u010d\u010e\u0007\u0019\u0002\u0002\u010e",
    "\u011c\u0005\u001c\u000f\u000b\u010f\u0110\f\t\u0002\u0002\u0110\u0111",
    "\u0007\u001a\u0002\u0002\u0111\u011c\u0005\u001c\u000f\n\u0112\u0113",
    "\f\b\u0002\u0002\u0113\u0114\u0007\u001b\u0002\u0002\u0114\u011c\u0005",
    "\u001c\u000f\t\u0115\u0116\f\u0007\u0002\u0002\u0116\u0117\u0007\u001c",
    "\u0002\u0002\u0117\u011c\u0005\u001c\u000f\b\u0118\u0119\f\u0005\u0002",
    "\u0002\u0119\u011a\u0007\u001d\u0002\u0002\u011a\u011c\u0005\u001c\u000f",
    "\u0006\u011b\u010c\u0003\u0002\u0002\u0002\u011b\u010f\u0003\u0002\u0002",
    "\u0002\u011b\u0112\u0003\u0002\u0002\u0002\u011b\u0115\u0003\u0002\u0002",
    "\u0002\u011b\u0118\u0003\u0002\u0002\u0002\u011c\u011f\u0003\u0002\u0002",
    "\u0002\u011d\u011b\u0003\u0002\u0002\u0002\u011d\u011e\u0003\u0002\u0002",
    "\u0002\u011e\u001d\u0003\u0002\u0002\u0002\u011f\u011d\u0003\u0002\u0002",
    "\u0002\u0120\u0121\t\u0002\u0002\u0002\u0121\u001f\u0003\u0002\u0002",
    "\u0002\u0016$Oaw~\u0080\u008d\u00ad\u00b1\u00b7\u00c3\u00ce\u00d9\u00e0",
    "\u00e7\u00ee\u00f5\u010a\u011b\u011d"].join("");


var atn = new antlr4.atn.ATNDeserializer().deserialize(serializedATN);

var decisionsToDFA = atn.decisionToState.map( function(ds, index) { return new antlr4.dfa.DFA(ds, index); });

var sharedContextCache = new antlr4.PredictionContextCache();

var literalNames = [ null, "'}'", "'opaque'", "';'", "'('", "')'", "'if'", 
                     "'=='", "'barrier'", "'OPENQASM'", "'qreg'", "'['", 
                     "']'", "'creg'", "'gate'", "'{'", "'measure'", "'->'", 
                     "'reset'", "'U'", "'CX'", "','", "'pi'", "'+'", "'-'", 
                     "'*'", "'/'", "'^'", "'sin'", "'cos'", "'tan'", "'exp'", 
                     "'ln'", "'sqrt'" ];

var symbolicNames = [ null, null, null, null, null, null, null, null, null, 
                      null, null, null, null, null, null, null, null, null, 
                      null, null, null, null, null, null, null, null, null, 
                      null, null, null, null, null, null, null, "ID", "REAL", 
                      "INT", "WS", "COMMENT", "LINE_COMMENT" ];

var ruleNames =  [ "mainprog", "statement", "version", "decl", "gatedecl", 
                   "goplist", "qop", "uop", "anylist", "idlist", "mixedlist", 
                   "argument", "explist", "exp", "unaryop" ];

function QASMParser (input) {
	antlr4.Parser.call(this, input);
    this._interp = new antlr4.atn.ParserATNSimulator(this, atn, decisionsToDFA, sharedContextCache);
    this.ruleNames = ruleNames;
    this.literalNames = literalNames;
    this.symbolicNames = symbolicNames;
    return this;
}

QASMParser.prototype = Object.create(antlr4.Parser.prototype);
QASMParser.prototype.constructor = QASMParser;

Object.defineProperty(QASMParser.prototype, "atn", {
	get : function() {
		return atn;
	}
});

QASMParser.EOF = antlr4.Token.EOF;
QASMParser.T__0 = 1;
QASMParser.T__1 = 2;
QASMParser.T__2 = 3;
QASMParser.T__3 = 4;
QASMParser.T__4 = 5;
QASMParser.T__5 = 6;
QASMParser.T__6 = 7;
QASMParser.T__7 = 8;
QASMParser.T__8 = 9;
QASMParser.T__9 = 10;
QASMParser.T__10 = 11;
QASMParser.T__11 = 12;
QASMParser.T__12 = 13;
QASMParser.T__13 = 14;
QASMParser.T__14 = 15;
QASMParser.T__15 = 16;
QASMParser.T__16 = 17;
QASMParser.T__17 = 18;
QASMParser.T__18 = 19;
QASMParser.T__19 = 20;
QASMParser.T__20 = 21;
QASMParser.T__21 = 22;
QASMParser.T__22 = 23;
QASMParser.T__23 = 24;
QASMParser.T__24 = 25;
QASMParser.T__25 = 26;
QASMParser.T__26 = 27;
QASMParser.T__27 = 28;
QASMParser.T__28 = 29;
QASMParser.T__29 = 30;
QASMParser.T__30 = 31;
QASMParser.T__31 = 32;
QASMParser.T__32 = 33;
QASMParser.ID = 34;
QASMParser.REAL = 35;
QASMParser.INT = 36;
QASMParser.WS = 37;
QASMParser.COMMENT = 38;
QASMParser.LINE_COMMENT = 39;

QASMParser.RULE_mainprog = 0;
QASMParser.RULE_statement = 1;
QASMParser.RULE_version = 2;
QASMParser.RULE_decl = 3;
QASMParser.RULE_gatedecl = 4;
QASMParser.RULE_goplist = 5;
QASMParser.RULE_qop = 6;
QASMParser.RULE_uop = 7;
QASMParser.RULE_anylist = 8;
QASMParser.RULE_idlist = 9;
QASMParser.RULE_mixedlist = 10;
QASMParser.RULE_argument = 11;
QASMParser.RULE_explist = 12;
QASMParser.RULE_exp = 13;
QASMParser.RULE_unaryop = 14;

function MainprogContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = QASMParser.RULE_mainprog;
    return this;
}

MainprogContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
MainprogContext.prototype.constructor = MainprogContext;

MainprogContext.prototype.version = function() {
    return this.getTypedRuleContext(VersionContext,0);
};

MainprogContext.prototype.statement = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(StatementContext);
    } else {
        return this.getTypedRuleContext(StatementContext,i);
    }
};

MainprogContext.prototype.enterRule = function(listener) {
    if(listener instanceof QASMListener ) {
        listener.enterMainprog(this);
	}
};

MainprogContext.prototype.exitRule = function(listener) {
    if(listener instanceof QASMListener ) {
        listener.exitMainprog(this);
	}
};




QASMParser.MainprogContext = MainprogContext;

QASMParser.prototype.mainprog = function() {

    var localctx = new MainprogContext(this, this._ctx, this.state);
    this.enterRule(localctx, 0, QASMParser.RULE_mainprog);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 30;
        this.version();
        this.state = 34;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while((((_la) & ~0x1f) == 0 && ((1 << _la) & ((1 << QASMParser.T__1) | (1 << QASMParser.T__5) | (1 << QASMParser.T__7) | (1 << QASMParser.T__9) | (1 << QASMParser.T__12) | (1 << QASMParser.T__13) | (1 << QASMParser.T__15) | (1 << QASMParser.T__17) | (1 << QASMParser.T__18) | (1 << QASMParser.T__19))) !== 0) || _la===QASMParser.ID) {
            this.state = 31;
            this.statement();
            this.state = 36;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function StatementContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = QASMParser.RULE_statement;
    return this;
}

StatementContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
StatementContext.prototype.constructor = StatementContext;

StatementContext.prototype.decl = function() {
    return this.getTypedRuleContext(DeclContext,0);
};

StatementContext.prototype.gatedecl = function() {
    return this.getTypedRuleContext(GatedeclContext,0);
};

StatementContext.prototype.goplist = function() {
    return this.getTypedRuleContext(GoplistContext,0);
};

StatementContext.prototype.ID = function() {
    return this.getToken(QASMParser.ID, 0);
};

StatementContext.prototype.idlist = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(IdlistContext);
    } else {
        return this.getTypedRuleContext(IdlistContext,i);
    }
};

StatementContext.prototype.qop = function() {
    return this.getTypedRuleContext(QopContext,0);
};

StatementContext.prototype.INT = function() {
    return this.getToken(QASMParser.INT, 0);
};

StatementContext.prototype.anylist = function() {
    return this.getTypedRuleContext(AnylistContext,0);
};

StatementContext.prototype.enterRule = function(listener) {
    if(listener instanceof QASMListener ) {
        listener.enterStatement(this);
	}
};

StatementContext.prototype.exitRule = function(listener) {
    if(listener instanceof QASMListener ) {
        listener.exitStatement(this);
	}
};




QASMParser.StatementContext = StatementContext;

QASMParser.prototype.statement = function() {

    var localctx = new StatementContext(this, this._ctx, this.state);
    this.enterRule(localctx, 2, QASMParser.RULE_statement);
    try {
        this.state = 77;
        this._errHandler.sync(this);
        var la_ = this._interp.adaptivePredict(this._input,1,this._ctx);
        switch(la_) {
        case 1:
            this.enterOuterAlt(localctx, 1);
            this.state = 37;
            this.decl();
            break;

        case 2:
            this.enterOuterAlt(localctx, 2);
            this.state = 38;
            this.gatedecl();
            this.state = 39;
            this.goplist();
            this.state = 40;
            this.match(QASMParser.T__0);
            break;

        case 3:
            this.enterOuterAlt(localctx, 3);
            this.state = 42;
            this.gatedecl();
            this.state = 43;
            this.match(QASMParser.T__0);
            break;

        case 4:
            this.enterOuterAlt(localctx, 4);
            this.state = 45;
            this.match(QASMParser.T__1);
            this.state = 46;
            this.match(QASMParser.ID);
            this.state = 47;
            this.idlist();
            this.state = 48;
            this.match(QASMParser.T__2);
            break;

        case 5:
            this.enterOuterAlt(localctx, 5);
            this.state = 50;
            this.match(QASMParser.T__1);
            this.state = 51;
            this.match(QASMParser.ID);
            this.state = 52;
            this.match(QASMParser.T__3);
            this.state = 53;
            this.match(QASMParser.T__4);
            this.state = 54;
            this.idlist();
            this.state = 55;
            this.match(QASMParser.T__2);
            break;

        case 6:
            this.enterOuterAlt(localctx, 6);
            this.state = 57;
            this.match(QASMParser.T__1);
            this.state = 58;
            this.match(QASMParser.ID);
            this.state = 59;
            this.match(QASMParser.T__3);
            this.state = 60;
            this.idlist();
            this.state = 61;
            this.match(QASMParser.T__4);
            this.state = 62;
            this.idlist();
            this.state = 63;
            this.match(QASMParser.T__2);
            break;

        case 7:
            this.enterOuterAlt(localctx, 7);
            this.state = 65;
            this.qop();
            break;

        case 8:
            this.enterOuterAlt(localctx, 8);
            this.state = 66;
            this.match(QASMParser.T__5);
            this.state = 67;
            this.match(QASMParser.T__3);
            this.state = 68;
            this.match(QASMParser.ID);
            this.state = 69;
            this.match(QASMParser.T__6);
            this.state = 70;
            this.match(QASMParser.INT);
            this.state = 71;
            this.match(QASMParser.T__4);
            this.state = 72;
            this.qop();
            break;

        case 9:
            this.enterOuterAlt(localctx, 9);
            this.state = 73;
            this.match(QASMParser.T__7);
            this.state = 74;
            this.anylist();
            this.state = 75;
            this.match(QASMParser.T__2);
            break;

        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function VersionContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = QASMParser.RULE_version;
    return this;
}

VersionContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
VersionContext.prototype.constructor = VersionContext;

VersionContext.prototype.REAL = function() {
    return this.getToken(QASMParser.REAL, 0);
};

VersionContext.prototype.enterRule = function(listener) {
    if(listener instanceof QASMListener ) {
        listener.enterVersion(this);
	}
};

VersionContext.prototype.exitRule = function(listener) {
    if(listener instanceof QASMListener ) {
        listener.exitVersion(this);
	}
};




QASMParser.VersionContext = VersionContext;

QASMParser.prototype.version = function() {

    var localctx = new VersionContext(this, this._ctx, this.state);
    this.enterRule(localctx, 4, QASMParser.RULE_version);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 79;
        this.match(QASMParser.T__8);
        this.state = 80;
        this.match(QASMParser.REAL);
        this.state = 81;
        this.match(QASMParser.T__2);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function DeclContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = QASMParser.RULE_decl;
    return this;
}

DeclContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
DeclContext.prototype.constructor = DeclContext;

DeclContext.prototype.ID = function() {
    return this.getToken(QASMParser.ID, 0);
};

DeclContext.prototype.INT = function() {
    return this.getToken(QASMParser.INT, 0);
};

DeclContext.prototype.enterRule = function(listener) {
    if(listener instanceof QASMListener ) {
        listener.enterDecl(this);
	}
};

DeclContext.prototype.exitRule = function(listener) {
    if(listener instanceof QASMListener ) {
        listener.exitDecl(this);
	}
};




QASMParser.DeclContext = DeclContext;

QASMParser.prototype.decl = function() {

    var localctx = new DeclContext(this, this._ctx, this.state);
    this.enterRule(localctx, 6, QASMParser.RULE_decl);
    try {
        this.state = 95;
        this._errHandler.sync(this);
        switch(this._input.LA(1)) {
        case QASMParser.T__9:
            this.enterOuterAlt(localctx, 1);
            this.state = 83;
            this.match(QASMParser.T__9);
            this.state = 84;
            this.match(QASMParser.ID);
            this.state = 85;
            this.match(QASMParser.T__10);
            this.state = 86;
            this.match(QASMParser.INT);
            this.state = 87;
            this.match(QASMParser.T__11);
            this.state = 88;
            this.match(QASMParser.T__2);
            break;
        case QASMParser.T__12:
            this.enterOuterAlt(localctx, 2);
            this.state = 89;
            this.match(QASMParser.T__12);
            this.state = 90;
            this.match(QASMParser.ID);
            this.state = 91;
            this.match(QASMParser.T__10);
            this.state = 92;
            this.match(QASMParser.INT);
            this.state = 93;
            this.match(QASMParser.T__11);
            this.state = 94;
            this.match(QASMParser.T__2);
            break;
        default:
            throw new antlr4.error.NoViableAltException(this);
        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function GatedeclContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = QASMParser.RULE_gatedecl;
    return this;
}

GatedeclContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
GatedeclContext.prototype.constructor = GatedeclContext;

GatedeclContext.prototype.ID = function() {
    return this.getToken(QASMParser.ID, 0);
};

GatedeclContext.prototype.idlist = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(IdlistContext);
    } else {
        return this.getTypedRuleContext(IdlistContext,i);
    }
};

GatedeclContext.prototype.enterRule = function(listener) {
    if(listener instanceof QASMListener ) {
        listener.enterGatedecl(this);
	}
};

GatedeclContext.prototype.exitRule = function(listener) {
    if(listener instanceof QASMListener ) {
        listener.exitGatedecl(this);
	}
};




QASMParser.GatedeclContext = GatedeclContext;

QASMParser.prototype.gatedecl = function() {

    var localctx = new GatedeclContext(this, this._ctx, this.state);
    this.enterRule(localctx, 8, QASMParser.RULE_gatedecl);
    try {
        this.state = 117;
        this._errHandler.sync(this);
        var la_ = this._interp.adaptivePredict(this._input,3,this._ctx);
        switch(la_) {
        case 1:
            this.enterOuterAlt(localctx, 1);
            this.state = 97;
            this.match(QASMParser.T__13);
            this.state = 98;
            this.match(QASMParser.ID);
            this.state = 99;
            this.idlist();
            this.state = 100;
            this.match(QASMParser.T__14);
            break;

        case 2:
            this.enterOuterAlt(localctx, 2);
            this.state = 102;
            this.match(QASMParser.T__13);
            this.state = 103;
            this.match(QASMParser.ID);
            this.state = 104;
            this.match(QASMParser.T__3);
            this.state = 105;
            this.match(QASMParser.T__4);
            this.state = 106;
            this.idlist();
            this.state = 107;
            this.match(QASMParser.T__14);
            break;

        case 3:
            this.enterOuterAlt(localctx, 3);
            this.state = 109;
            this.match(QASMParser.T__13);
            this.state = 110;
            this.match(QASMParser.ID);
            this.state = 111;
            this.match(QASMParser.T__3);
            this.state = 112;
            this.idlist();
            this.state = 113;
            this.match(QASMParser.T__4);
            this.state = 114;
            this.idlist();
            this.state = 115;
            this.match(QASMParser.T__14);
            break;

        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function GoplistContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = QASMParser.RULE_goplist;
    return this;
}

GoplistContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
GoplistContext.prototype.constructor = GoplistContext;

GoplistContext.prototype.uop = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(UopContext);
    } else {
        return this.getTypedRuleContext(UopContext,i);
    }
};

GoplistContext.prototype.idlist = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(IdlistContext);
    } else {
        return this.getTypedRuleContext(IdlistContext,i);
    }
};

GoplistContext.prototype.enterRule = function(listener) {
    if(listener instanceof QASMListener ) {
        listener.enterGoplist(this);
	}
};

GoplistContext.prototype.exitRule = function(listener) {
    if(listener instanceof QASMListener ) {
        listener.exitGoplist(this);
	}
};




QASMParser.GoplistContext = GoplistContext;

QASMParser.prototype.goplist = function() {

    var localctx = new GoplistContext(this, this._ctx, this.state);
    this.enterRule(localctx, 10, QASMParser.RULE_goplist);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 124; 
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        do {
            this.state = 124;
            this._errHandler.sync(this);
            switch(this._input.LA(1)) {
            case QASMParser.T__18:
            case QASMParser.T__19:
            case QASMParser.ID:
                this.state = 119;
                this.uop();
                break;
            case QASMParser.T__7:
                this.state = 120;
                this.match(QASMParser.T__7);
                this.state = 121;
                this.idlist();
                this.state = 122;
                this.match(QASMParser.T__2);
                break;
            default:
                throw new antlr4.error.NoViableAltException(this);
            }
            this.state = 126; 
            this._errHandler.sync(this);
            _la = this._input.LA(1);
        } while(((((_la - 8)) & ~0x1f) == 0 && ((1 << (_la - 8)) & ((1 << (QASMParser.T__7 - 8)) | (1 << (QASMParser.T__18 - 8)) | (1 << (QASMParser.T__19 - 8)) | (1 << (QASMParser.ID - 8)))) !== 0));
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function QopContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = QASMParser.RULE_qop;
    return this;
}

QopContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
QopContext.prototype.constructor = QopContext;

QopContext.prototype.uop = function() {
    return this.getTypedRuleContext(UopContext,0);
};

QopContext.prototype.argument = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(ArgumentContext);
    } else {
        return this.getTypedRuleContext(ArgumentContext,i);
    }
};

QopContext.prototype.enterRule = function(listener) {
    if(listener instanceof QASMListener ) {
        listener.enterQop(this);
	}
};

QopContext.prototype.exitRule = function(listener) {
    if(listener instanceof QASMListener ) {
        listener.exitQop(this);
	}
};




QASMParser.QopContext = QopContext;

QASMParser.prototype.qop = function() {

    var localctx = new QopContext(this, this._ctx, this.state);
    this.enterRule(localctx, 12, QASMParser.RULE_qop);
    try {
        this.state = 139;
        this._errHandler.sync(this);
        switch(this._input.LA(1)) {
        case QASMParser.T__18:
        case QASMParser.T__19:
        case QASMParser.ID:
            this.enterOuterAlt(localctx, 1);
            this.state = 128;
            this.uop();
            break;
        case QASMParser.T__15:
            this.enterOuterAlt(localctx, 2);
            this.state = 129;
            this.match(QASMParser.T__15);
            this.state = 130;
            this.argument();
            this.state = 131;
            this.match(QASMParser.T__16);
            this.state = 132;
            this.argument();
            this.state = 133;
            this.match(QASMParser.T__2);
            break;
        case QASMParser.T__17:
            this.enterOuterAlt(localctx, 3);
            this.state = 135;
            this.match(QASMParser.T__17);
            this.state = 136;
            this.argument();
            this.state = 137;
            this.match(QASMParser.T__2);
            break;
        default:
            throw new antlr4.error.NoViableAltException(this);
        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function UopContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = QASMParser.RULE_uop;
    return this;
}

UopContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
UopContext.prototype.constructor = UopContext;

UopContext.prototype.explist = function() {
    return this.getTypedRuleContext(ExplistContext,0);
};

UopContext.prototype.argument = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(ArgumentContext);
    } else {
        return this.getTypedRuleContext(ArgumentContext,i);
    }
};

UopContext.prototype.ID = function() {
    return this.getToken(QASMParser.ID, 0);
};

UopContext.prototype.anylist = function() {
    return this.getTypedRuleContext(AnylistContext,0);
};

UopContext.prototype.enterRule = function(listener) {
    if(listener instanceof QASMListener ) {
        listener.enterUop(this);
	}
};

UopContext.prototype.exitRule = function(listener) {
    if(listener instanceof QASMListener ) {
        listener.exitUop(this);
	}
};




QASMParser.UopContext = UopContext;

QASMParser.prototype.uop = function() {

    var localctx = new UopContext(this, this._ctx, this.state);
    this.enterRule(localctx, 14, QASMParser.RULE_uop);
    try {
        this.state = 171;
        this._errHandler.sync(this);
        var la_ = this._interp.adaptivePredict(this._input,7,this._ctx);
        switch(la_) {
        case 1:
            this.enterOuterAlt(localctx, 1);
            this.state = 141;
            this.match(QASMParser.T__18);
            this.state = 142;
            this.match(QASMParser.T__3);
            this.state = 143;
            this.explist();
            this.state = 144;
            this.match(QASMParser.T__4);
            this.state = 145;
            this.argument();
            this.state = 146;
            this.match(QASMParser.T__2);
            break;

        case 2:
            this.enterOuterAlt(localctx, 2);
            this.state = 148;
            this.match(QASMParser.T__19);
            this.state = 149;
            this.argument();
            this.state = 150;
            this.match(QASMParser.T__20);
            this.state = 151;
            this.argument();
            this.state = 152;
            this.match(QASMParser.T__2);
            break;

        case 3:
            this.enterOuterAlt(localctx, 3);
            this.state = 154;
            this.match(QASMParser.ID);
            this.state = 155;
            this.anylist();
            this.state = 156;
            this.match(QASMParser.T__2);
            break;

        case 4:
            this.enterOuterAlt(localctx, 4);
            this.state = 158;
            this.match(QASMParser.ID);
            this.state = 159;
            this.match(QASMParser.T__3);
            this.state = 160;
            this.match(QASMParser.T__4);
            this.state = 161;
            this.anylist();
            this.state = 162;
            this.match(QASMParser.T__2);
            break;

        case 5:
            this.enterOuterAlt(localctx, 5);
            this.state = 164;
            this.match(QASMParser.ID);
            this.state = 165;
            this.match(QASMParser.T__3);
            this.state = 166;
            this.explist();
            this.state = 167;
            this.match(QASMParser.T__4);
            this.state = 168;
            this.anylist();
            this.state = 169;
            this.match(QASMParser.T__2);
            break;

        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function AnylistContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = QASMParser.RULE_anylist;
    return this;
}

AnylistContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
AnylistContext.prototype.constructor = AnylistContext;

AnylistContext.prototype.idlist = function() {
    return this.getTypedRuleContext(IdlistContext,0);
};

AnylistContext.prototype.mixedlist = function() {
    return this.getTypedRuleContext(MixedlistContext,0);
};

AnylistContext.prototype.enterRule = function(listener) {
    if(listener instanceof QASMListener ) {
        listener.enterAnylist(this);
	}
};

AnylistContext.prototype.exitRule = function(listener) {
    if(listener instanceof QASMListener ) {
        listener.exitAnylist(this);
	}
};




QASMParser.AnylistContext = AnylistContext;

QASMParser.prototype.anylist = function() {

    var localctx = new AnylistContext(this, this._ctx, this.state);
    this.enterRule(localctx, 16, QASMParser.RULE_anylist);
    try {
        this.state = 175;
        this._errHandler.sync(this);
        var la_ = this._interp.adaptivePredict(this._input,8,this._ctx);
        switch(la_) {
        case 1:
            this.enterOuterAlt(localctx, 1);
            this.state = 173;
            this.idlist();
            break;

        case 2:
            this.enterOuterAlt(localctx, 2);
            this.state = 174;
            this.mixedlist();
            break;

        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function IdlistContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = QASMParser.RULE_idlist;
    return this;
}

IdlistContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
IdlistContext.prototype.constructor = IdlistContext;

IdlistContext.prototype.ID = function(i) {
	if(i===undefined) {
		i = null;
	}
    if(i===null) {
        return this.getTokens(QASMParser.ID);
    } else {
        return this.getToken(QASMParser.ID, i);
    }
};


IdlistContext.prototype.enterRule = function(listener) {
    if(listener instanceof QASMListener ) {
        listener.enterIdlist(this);
	}
};

IdlistContext.prototype.exitRule = function(listener) {
    if(listener instanceof QASMListener ) {
        listener.exitIdlist(this);
	}
};




QASMParser.IdlistContext = IdlistContext;

QASMParser.prototype.idlist = function() {

    var localctx = new IdlistContext(this, this._ctx, this.state);
    this.enterRule(localctx, 18, QASMParser.RULE_idlist);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 181;
        this._errHandler.sync(this);
        var _alt = this._interp.adaptivePredict(this._input,9,this._ctx)
        while(_alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER) {
            if(_alt===1) {
                this.state = 177;
                this.match(QASMParser.ID);
                this.state = 178;
                this.match(QASMParser.T__20); 
            }
            this.state = 183;
            this._errHandler.sync(this);
            _alt = this._interp.adaptivePredict(this._input,9,this._ctx);
        }

        this.state = 184;
        this.match(QASMParser.ID);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function MixedlistContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = QASMParser.RULE_mixedlist;
    return this;
}

MixedlistContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
MixedlistContext.prototype.constructor = MixedlistContext;

MixedlistContext.prototype.ID = function(i) {
	if(i===undefined) {
		i = null;
	}
    if(i===null) {
        return this.getTokens(QASMParser.ID);
    } else {
        return this.getToken(QASMParser.ID, i);
    }
};


MixedlistContext.prototype.INT = function(i) {
	if(i===undefined) {
		i = null;
	}
    if(i===null) {
        return this.getTokens(QASMParser.INT);
    } else {
        return this.getToken(QASMParser.INT, i);
    }
};


MixedlistContext.prototype.enterRule = function(listener) {
    if(listener instanceof QASMListener ) {
        listener.enterMixedlist(this);
	}
};

MixedlistContext.prototype.exitRule = function(listener) {
    if(listener instanceof QASMListener ) {
        listener.exitMixedlist(this);
	}
};




QASMParser.MixedlistContext = MixedlistContext;

QASMParser.prototype.mixedlist = function() {

    var localctx = new MixedlistContext(this, this._ctx, this.state);
    this.enterRule(localctx, 20, QASMParser.RULE_mixedlist);
    try {
        this.state = 229;
        this._errHandler.sync(this);
        var la_ = this._interp.adaptivePredict(this._input,14,this._ctx);
        switch(la_) {
        case 1:
            this.enterOuterAlt(localctx, 1);
            this.state = 193;
            this._errHandler.sync(this);
            var _alt = this._interp.adaptivePredict(this._input,10,this._ctx)
            while(_alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER) {
                if(_alt===1) {
                    this.state = 186;
                    this.match(QASMParser.ID);
                    this.state = 187;
                    this.match(QASMParser.T__10);
                    this.state = 188;
                    this.match(QASMParser.INT);
                    this.state = 189;
                    this.match(QASMParser.T__11);
                    this.state = 190;
                    this.match(QASMParser.T__20); 
                }
                this.state = 195;
                this._errHandler.sync(this);
                _alt = this._interp.adaptivePredict(this._input,10,this._ctx);
            }

            this.state = 196;
            this.match(QASMParser.ID);
            break;

        case 2:
            this.enterOuterAlt(localctx, 2);
            this.state = 204;
            this._errHandler.sync(this);
            var _alt = this._interp.adaptivePredict(this._input,11,this._ctx)
            while(_alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER) {
                if(_alt===1) {
                    this.state = 197;
                    this.match(QASMParser.ID);
                    this.state = 198;
                    this.match(QASMParser.T__10);
                    this.state = 199;
                    this.match(QASMParser.INT);
                    this.state = 200;
                    this.match(QASMParser.T__11);
                    this.state = 201;
                    this.match(QASMParser.T__20); 
                }
                this.state = 206;
                this._errHandler.sync(this);
                _alt = this._interp.adaptivePredict(this._input,11,this._ctx);
            }

            this.state = 207;
            this.match(QASMParser.ID);
            this.state = 208;
            this.match(QASMParser.T__10);
            this.state = 209;
            this.match(QASMParser.INT);
            this.state = 210;
            this.match(QASMParser.T__11);
            break;

        case 3:
            this.enterOuterAlt(localctx, 3);
            this.state = 222;
            this._errHandler.sync(this);
            var _alt = this._interp.adaptivePredict(this._input,13,this._ctx)
            while(_alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER) {
                if(_alt===1) {
                    this.state = 215;
                    this._errHandler.sync(this);
                    var _alt = this._interp.adaptivePredict(this._input,12,this._ctx)
                    while(_alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER) {
                        if(_alt===1) {
                            this.state = 211;
                            this.match(QASMParser.ID);
                            this.state = 212;
                            this.match(QASMParser.T__20); 
                        }
                        this.state = 217;
                        this._errHandler.sync(this);
                        _alt = this._interp.adaptivePredict(this._input,12,this._ctx);
                    }

                    this.state = 218;
                    this.match(QASMParser.ID);
                    this.state = 219;
                    this.match(QASMParser.T__20); 
                }
                this.state = 224;
                this._errHandler.sync(this);
                _alt = this._interp.adaptivePredict(this._input,13,this._ctx);
            }

            this.state = 225;
            this.match(QASMParser.ID);
            this.state = 226;
            this.match(QASMParser.T__10);
            this.state = 227;
            this.match(QASMParser.INT);
            this.state = 228;
            this.match(QASMParser.T__11);
            break;

        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function ArgumentContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = QASMParser.RULE_argument;
    return this;
}

ArgumentContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
ArgumentContext.prototype.constructor = ArgumentContext;

ArgumentContext.prototype.ID = function() {
    return this.getToken(QASMParser.ID, 0);
};

ArgumentContext.prototype.INT = function() {
    return this.getToken(QASMParser.INT, 0);
};

ArgumentContext.prototype.enterRule = function(listener) {
    if(listener instanceof QASMListener ) {
        listener.enterArgument(this);
	}
};

ArgumentContext.prototype.exitRule = function(listener) {
    if(listener instanceof QASMListener ) {
        listener.exitArgument(this);
	}
};




QASMParser.ArgumentContext = ArgumentContext;

QASMParser.prototype.argument = function() {

    var localctx = new ArgumentContext(this, this._ctx, this.state);
    this.enterRule(localctx, 22, QASMParser.RULE_argument);
    try {
        this.state = 236;
        this._errHandler.sync(this);
        var la_ = this._interp.adaptivePredict(this._input,15,this._ctx);
        switch(la_) {
        case 1:
            this.enterOuterAlt(localctx, 1);
            this.state = 231;
            this.match(QASMParser.ID);
            break;

        case 2:
            this.enterOuterAlt(localctx, 2);
            this.state = 232;
            this.match(QASMParser.ID);
            this.state = 233;
            this.match(QASMParser.T__10);
            this.state = 234;
            this.match(QASMParser.INT);
            this.state = 235;
            this.match(QASMParser.T__11);
            break;

        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function ExplistContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = QASMParser.RULE_explist;
    return this;
}

ExplistContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
ExplistContext.prototype.constructor = ExplistContext;

ExplistContext.prototype.exp = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(ExpContext);
    } else {
        return this.getTypedRuleContext(ExpContext,i);
    }
};

ExplistContext.prototype.enterRule = function(listener) {
    if(listener instanceof QASMListener ) {
        listener.enterExplist(this);
	}
};

ExplistContext.prototype.exitRule = function(listener) {
    if(listener instanceof QASMListener ) {
        listener.exitExplist(this);
	}
};




QASMParser.ExplistContext = ExplistContext;

QASMParser.prototype.explist = function() {

    var localctx = new ExplistContext(this, this._ctx, this.state);
    this.enterRule(localctx, 24, QASMParser.RULE_explist);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 243;
        this._errHandler.sync(this);
        var _alt = this._interp.adaptivePredict(this._input,16,this._ctx)
        while(_alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER) {
            if(_alt===1) {
                this.state = 238;
                this.exp(0);
                this.state = 239;
                this.match(QASMParser.T__20); 
            }
            this.state = 245;
            this._errHandler.sync(this);
            _alt = this._interp.adaptivePredict(this._input,16,this._ctx);
        }

        this.state = 246;
        this.exp(0);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function ExpContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = QASMParser.RULE_exp;
    return this;
}

ExpContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
ExpContext.prototype.constructor = ExpContext;

ExpContext.prototype.REAL = function() {
    return this.getToken(QASMParser.REAL, 0);
};

ExpContext.prototype.INT = function() {
    return this.getToken(QASMParser.INT, 0);
};

ExpContext.prototype.ID = function() {
    return this.getToken(QASMParser.ID, 0);
};

ExpContext.prototype.exp = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(ExpContext);
    } else {
        return this.getTypedRuleContext(ExpContext,i);
    }
};

ExpContext.prototype.unaryop = function() {
    return this.getTypedRuleContext(UnaryopContext,0);
};

ExpContext.prototype.enterRule = function(listener) {
    if(listener instanceof QASMListener ) {
        listener.enterExp(this);
	}
};

ExpContext.prototype.exitRule = function(listener) {
    if(listener instanceof QASMListener ) {
        listener.exitExp(this);
	}
};



QASMParser.prototype.exp = function(_p) {
	if(_p===undefined) {
	    _p = 0;
	}
    var _parentctx = this._ctx;
    var _parentState = this.state;
    var localctx = new ExpContext(this, this._ctx, _parentState);
    var _prevctx = localctx;
    var _startState = 26;
    this.enterRecursionRule(localctx, 26, QASMParser.RULE_exp, _p);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 264;
        this._errHandler.sync(this);
        switch(this._input.LA(1)) {
        case QASMParser.REAL:
            this.state = 249;
            this.match(QASMParser.REAL);
            break;
        case QASMParser.INT:
            this.state = 250;
            this.match(QASMParser.INT);
            break;
        case QASMParser.T__21:
            this.state = 251;
            this.match(QASMParser.T__21);
            break;
        case QASMParser.ID:
            this.state = 252;
            this.match(QASMParser.ID);
            break;
        case QASMParser.T__23:
            this.state = 253;
            this.match(QASMParser.T__23);
            this.state = 254;
            this.exp(4);
            break;
        case QASMParser.T__3:
            this.state = 255;
            this.match(QASMParser.T__3);
            this.state = 256;
            this.exp(0);
            this.state = 257;
            this.match(QASMParser.T__4);
            break;
        case QASMParser.T__27:
        case QASMParser.T__28:
        case QASMParser.T__29:
        case QASMParser.T__30:
        case QASMParser.T__31:
        case QASMParser.T__32:
            this.state = 259;
            this.unaryop();
            this.state = 260;
            this.match(QASMParser.T__3);
            this.state = 261;
            this.exp(0);
            this.state = 262;
            this.match(QASMParser.T__4);
            break;
        default:
            throw new antlr4.error.NoViableAltException(this);
        }
        this._ctx.stop = this._input.LT(-1);
        this.state = 283;
        this._errHandler.sync(this);
        var _alt = this._interp.adaptivePredict(this._input,19,this._ctx)
        while(_alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER) {
            if(_alt===1) {
                if(this._parseListeners!==null) {
                    this.triggerExitRuleEvent();
                }
                _prevctx = localctx;
                this.state = 281;
                this._errHandler.sync(this);
                var la_ = this._interp.adaptivePredict(this._input,18,this._ctx);
                switch(la_) {
                case 1:
                    localctx = new ExpContext(this, _parentctx, _parentState);
                    this.pushNewRecursionContext(localctx, _startState, QASMParser.RULE_exp);
                    this.state = 266;
                    if (!( this.precpred(this._ctx, 8))) {
                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 8)");
                    }
                    this.state = 267;
                    this.match(QASMParser.T__22);
                    this.state = 268;
                    this.exp(9);
                    break;

                case 2:
                    localctx = new ExpContext(this, _parentctx, _parentState);
                    this.pushNewRecursionContext(localctx, _startState, QASMParser.RULE_exp);
                    this.state = 269;
                    if (!( this.precpred(this._ctx, 7))) {
                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 7)");
                    }
                    this.state = 270;
                    this.match(QASMParser.T__23);
                    this.state = 271;
                    this.exp(8);
                    break;

                case 3:
                    localctx = new ExpContext(this, _parentctx, _parentState);
                    this.pushNewRecursionContext(localctx, _startState, QASMParser.RULE_exp);
                    this.state = 272;
                    if (!( this.precpred(this._ctx, 6))) {
                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 6)");
                    }
                    this.state = 273;
                    this.match(QASMParser.T__24);
                    this.state = 274;
                    this.exp(7);
                    break;

                case 4:
                    localctx = new ExpContext(this, _parentctx, _parentState);
                    this.pushNewRecursionContext(localctx, _startState, QASMParser.RULE_exp);
                    this.state = 275;
                    if (!( this.precpred(this._ctx, 5))) {
                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 5)");
                    }
                    this.state = 276;
                    this.match(QASMParser.T__25);
                    this.state = 277;
                    this.exp(6);
                    break;

                case 5:
                    localctx = new ExpContext(this, _parentctx, _parentState);
                    this.pushNewRecursionContext(localctx, _startState, QASMParser.RULE_exp);
                    this.state = 278;
                    if (!( this.precpred(this._ctx, 3))) {
                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 3)");
                    }
                    this.state = 279;
                    this.match(QASMParser.T__26);
                    this.state = 280;
                    this.exp(4);
                    break;

                } 
            }
            this.state = 285;
            this._errHandler.sync(this);
            _alt = this._interp.adaptivePredict(this._input,19,this._ctx);
        }

    } catch( error) {
        if(error instanceof antlr4.error.RecognitionException) {
	        localctx.exception = error;
	        this._errHandler.reportError(this, error);
	        this._errHandler.recover(this, error);
	    } else {
	    	throw error;
	    }
    } finally {
        this.unrollRecursionContexts(_parentctx)
    }
    return localctx;
};

function UnaryopContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = QASMParser.RULE_unaryop;
    return this;
}

UnaryopContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
UnaryopContext.prototype.constructor = UnaryopContext;


UnaryopContext.prototype.enterRule = function(listener) {
    if(listener instanceof QASMListener ) {
        listener.enterUnaryop(this);
	}
};

UnaryopContext.prototype.exitRule = function(listener) {
    if(listener instanceof QASMListener ) {
        listener.exitUnaryop(this);
	}
};




QASMParser.UnaryopContext = UnaryopContext;

QASMParser.prototype.unaryop = function() {

    var localctx = new UnaryopContext(this, this._ctx, this.state);
    this.enterRule(localctx, 28, QASMParser.RULE_unaryop);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 286;
        _la = this._input.LA(1);
        if(!(((((_la - 28)) & ~0x1f) == 0 && ((1 << (_la - 28)) & ((1 << (QASMParser.T__27 - 28)) | (1 << (QASMParser.T__28 - 28)) | (1 << (QASMParser.T__29 - 28)) | (1 << (QASMParser.T__30 - 28)) | (1 << (QASMParser.T__31 - 28)) | (1 << (QASMParser.T__32 - 28)))) !== 0))) {
        this._errHandler.recoverInline(this);
        }
        else {
        	this._errHandler.reportMatch(this);
            this.consume();
        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};


QASMParser.prototype.sempred = function(localctx, ruleIndex, predIndex) {
	switch(ruleIndex) {
	case 13:
			return this.exp_sempred(localctx, predIndex);
    default:
        throw "No predicate with index:" + ruleIndex;
   }
};

QASMParser.prototype.exp_sempred = function(localctx, predIndex) {
	switch(predIndex) {
		case 0:
			return this.precpred(this._ctx, 8);
		case 1:
			return this.precpred(this._ctx, 7);
		case 2:
			return this.precpred(this._ctx, 6);
		case 3:
			return this.precpred(this._ctx, 5);
		case 4:
			return this.precpred(this._ctx, 3);
		default:
			throw "No predicate with index:" + predIndex;
	}
};


exports.QASMParser = QASMParser;
