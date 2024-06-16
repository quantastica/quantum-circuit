import {
	ATN,
	ATNDeserializer,
	DFA,
	FailedPredicateException,
	NoViableAltException,
	Parser,
	ParserATNSimulator,
	ParserRuleContext,
	PredictionContextCache,
	RecognitionException,
	Token,
} from "antlr4";
import { QASMListener } from "./QASMListener.js";

const serializedATN = [
	"\u0003\u608b\ua72a\u8133\ub9ed\u417c\u3be7\u7786\u5964",
	"\u0003-\u0130\u0004\u0002\t\u0002\u0004\u0003\t\u0003\u0004\u0004\t",
	"\u0004\u0004\u0005\t\u0005\u0004\u0006\t\u0006\u0004\u0007\t\u0007\u0004",
	"\b\t\b\u0004\t\t\t\u0004\n\t\n\u0004\u000b\t\u000b\u0004\f\t\f\u0004",
	"\r\t\r\u0004\u000e\t\u000e\u0004\u000f\t\u000f\u0004\u0010\t\u0010\u0004",
	"\u0011\t\u0011\u0004\u0012\t\u0012\u0004\u0013\t\u0013\u0003\u0002\u0003",
	"\u0002\u0007\u0002)\n\u0002\f\u0002\u000e\u0002,\u000b\u0002\u0003\u0003",
	"\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003",
	"\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003",
	"\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003",
	"\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003",
	"\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003",
	"\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003",
	"\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0005\u0003W\n\u0003",
	"\u0003\u0004\u0003\u0004\u0003\u0004\u0003\u0004\u0003\u0005\u0003\u0005",
	"\u0003\u0005\u0003\u0005\u0003\u0006\u0003\u0006\u0003\u0007\u0003\u0007",
	"\u0003\u0007\u0003\u0007\u0003\u0007\u0003\u0007\u0003\u0007\u0003\u0007",
	"\u0003\u0007\u0003\u0007\u0003\u0007\u0003\u0007\u0005\u0007o\n\u0007",
	"\u0003\b\u0003\b\u0003\b\u0003\b\u0003\b\u0003\b\u0003\b\u0003\b\u0003",
	"\b\u0003\b\u0003\b\u0003\b\u0003\b\u0003\b\u0003\b\u0003\b\u0003\b\u0003",
	"\b\u0003\b\u0003\b\u0005\b\u0085\n\b\u0003\t\u0003\t\u0003\t\u0003\t",
	"\u0003\t\u0006\t\u008c\n\t\r\t\u000e\t\u008d\u0003\n\u0003\n\u0003\n",
	"\u0003\n\u0003\n\u0003\n\u0003\n\u0003\n\u0003\n\u0003\n\u0003\n\u0005",
	"\n\u009b\n\n\u0003\u000b\u0003\u000b\u0003\u000b\u0003\u000b\u0003\u000b",
	"\u0003\u000b\u0003\u000b\u0003\u000b\u0003\u000b\u0003\u000b\u0003\u000b",
	"\u0003\u000b\u0003\u000b\u0003\u000b\u0003\u000b\u0003\u000b\u0003\u000b",
	"\u0003\u000b\u0003\u000b\u0003\u000b\u0003\u000b\u0003\u000b\u0003\u000b",
	"\u0003\u000b\u0003\u000b\u0003\u000b\u0003\u000b\u0003\u000b\u0003\u000b",
	"\u0003\u000b\u0005\u000b\u00bb\n\u000b\u0003\f\u0003\f\u0005\f\u00bf",
	"\n\f\u0003\r\u0003\r\u0007\r\u00c3\n\r\f\r\u000e\r\u00c6\u000b\r\u0003",
	"\r\u0003\r\u0003\u000e\u0003\u000e\u0003\u000e\u0003\u000e\u0003\u000e",
	"\u0007\u000e\u00cf\n\u000e\f\u000e\u000e\u000e\u00d2\u000b\u000e\u0003",
	"\u000e\u0003\u000e\u0003\u000e\u0003\u000e\u0003\u000e\u0003\u000e\u0007",
	"\u000e\u00da\n\u000e\f\u000e\u000e\u000e\u00dd\u000b\u000e\u0003\u000e",
	"\u0003\u000e\u0003\u000e\u0003\u000e\u0003\u000e\u0003\u000e\u0007\u000e",
	"\u00e5\n\u000e\f\u000e\u000e\u000e\u00e8\u000b\u000e\u0003\u000e\u0003",
	"\u000e\u0007\u000e\u00ec\n\u000e\f\u000e\u000e\u000e\u00ef\u000b\u000e",
	"\u0003\u000e\u0003\u000e\u0003\u000e\u0003\u000e\u0005\u000e\u00f5\n",
	"\u000e\u0003\u000f\u0003\u000f\u0003\u000f\u0003\u000f\u0003\u000f\u0005",
	"\u000f\u00fc\n\u000f\u0003\u0010\u0003\u0010\u0003\u0010\u0007\u0010",
	"\u0101\n\u0010\f\u0010\u000e\u0010\u0104\u000b\u0010\u0003\u0010\u0003",
	"\u0010\u0003\u0011\u0003\u0011\u0005\u0011\u010a\n\u0011\u0003\u0011",
	"\u0003\u0011\u0003\u0011\u0003\u0011\u0003\u0011\u0005\u0011\u0111\n",
	"\u0011\u0003\u0011\u0003\u0011\u0003\u0011\u0003\u0011\u0003\u0011\u0003",
	"\u0011\u0005\u0011\u0119\n\u0011\u0003\u0011\u0005\u0011\u011c\n\u0011",
	"\u0003\u0011\u0003\u0011\u0003\u0011\u0003\u0011\u0003\u0011\u0003\u0011",
	"\u0003\u0011\u0003\u0011\u0003\u0011\u0007\u0011\u0127\n\u0011\f\u0011",
	"\u000e\u0011\u012a\u000b\u0011\u0003\u0012\u0003\u0012\u0003\u0013\u0003",
	"\u0013\u0003\u0013\u0002\u0003 \u0014\u0002\u0004\u0006\b\n\f\u000e",
	'\u0010\u0012\u0014\u0016\u0018\u001a\u001c\u001e "$\u0002\u0006\u0003',
	"\u0002\u001c\u001d\u0003\u0002\u001a\u001b\u0004\u0002$%()\u0003\u0002",
	"\u001e#\u0002\u0144\u0002&\u0003\u0002\u0002\u0002\u0004V\u0003\u0002",
	"\u0002\u0002\u0006X\u0003\u0002\u0002\u0002\b\\\u0003\u0002\u0002\u0002",
	"\n`\u0003\u0002\u0002\u0002\fn\u0003\u0002\u0002\u0002\u000e\u0084\u0003",
	"\u0002\u0002\u0002\u0010\u008b\u0003\u0002\u0002\u0002\u0012\u009a\u0003",
	"\u0002\u0002\u0002\u0014\u00ba\u0003\u0002\u0002\u0002\u0016\u00be\u0003",
	"\u0002\u0002\u0002\u0018\u00c4\u0003\u0002\u0002\u0002\u001a\u00f4\u0003",
	"\u0002\u0002\u0002\u001c\u00fb\u0003\u0002\u0002\u0002\u001e\u0102\u0003",
	'\u0002\u0002\u0002 \u011b\u0003\u0002\u0002\u0002"\u012b\u0003\u0002',
	"\u0002\u0002$\u012d\u0003\u0002\u0002\u0002&*\u0005\u0006\u0004\u0002",
	"')\u0005\u0004\u0003\u0002('\u0003\u0002\u0002\u0002),\u0003\u0002",
	"\u0002\u0002*(\u0003\u0002\u0002\u0002*+\u0003\u0002\u0002\u0002+\u0003",
	"\u0003\u0002\u0002\u0002,*\u0003\u0002\u0002\u0002-W\u0005\f\u0007\u0002",
	"./\u0005\u000e\b\u0002/0\u0005\u0010\t\u000201\u0007\u0003\u0002\u0002",
	"1W\u0003\u0002\u0002\u000223\u0005\u000e\b\u000234\u0007\u0003\u0002",
	"\u00024W\u0003\u0002\u0002\u000256\u0007\u0004\u0002\u000267\u0007)",
	"\u0002\u000278\u0005\u0018\r\u000289\u0007\u0005\u0002\u00029W\u0003",
	"\u0002\u0002\u0002:;\u0007\u0004\u0002\u0002;<\u0007)\u0002\u0002<=",
	"\u0007\u0006\u0002\u0002=>\u0007\u0007\u0002\u0002>?\u0005\u0018\r\u0002",
	"?@\u0007\u0005\u0002\u0002@W\u0003\u0002\u0002\u0002AB\u0007\u0004\u0002",
	"\u0002BC\u0007)\u0002\u0002CD\u0007\u0006\u0002\u0002DE\u0005\u0018",
	"\r\u0002EF\u0007\u0007\u0002\u0002FG\u0005\u0018\r\u0002GH\u0007\u0005",
	"\u0002\u0002HW\u0003\u0002\u0002\u0002IW\u0005\u0012\n\u0002JK\u0007",
	"\b\u0002\u0002KL\u0007\u0006\u0002\u0002LM\u0007)\u0002\u0002MN\u0007",
	"\t\u0002\u0002NO\u0007(\u0002\u0002OP\u0007\u0007\u0002\u0002PW\u0005",
	"\u0012\n\u0002QR\u0007\n\u0002\u0002RS\u0005\u0016\f\u0002ST\u0007\u0005",
	"\u0002\u0002TW\u0003\u0002\u0002\u0002UW\u0005\b\u0005\u0002V-\u0003",
	"\u0002\u0002\u0002V.\u0003\u0002\u0002\u0002V2\u0003\u0002\u0002\u0002",
	"V5\u0003\u0002\u0002\u0002V:\u0003\u0002\u0002\u0002VA\u0003\u0002\u0002",
	"\u0002VI\u0003\u0002\u0002\u0002VJ\u0003\u0002\u0002\u0002VQ\u0003\u0002",
	"\u0002\u0002VU\u0003\u0002\u0002\u0002W\u0005\u0003\u0002\u0002\u0002",
	"XY\u0007\u000b\u0002\u0002YZ\u0007%\u0002\u0002Z[\u0007\u0005\u0002",
	"\u0002[\u0007\u0003\u0002\u0002\u0002\\]\u0007\f\u0002\u0002]^\u0005",
	"\n\u0006\u0002^_\u0007\u0005\u0002\u0002_\t\u0003\u0002\u0002\u0002",
	"`a\u0007+\u0002\u0002a\u000b\u0003\u0002\u0002\u0002bc\u0007\r\u0002",
	"\u0002cd\u0007)\u0002\u0002de\u0007\u000e\u0002\u0002ef\u0007(\u0002",
	"\u0002fg\u0007\u000f\u0002\u0002go\u0007\u0005\u0002\u0002hi\u0007\u0010",
	"\u0002\u0002ij\u0007)\u0002\u0002jk\u0007\u000e\u0002\u0002kl\u0007",
	"(\u0002\u0002lm\u0007\u000f\u0002\u0002mo\u0007\u0005\u0002\u0002nb",
	"\u0003\u0002\u0002\u0002nh\u0003\u0002\u0002\u0002o\r\u0003\u0002\u0002",
	"\u0002pq\u0007\u0011\u0002\u0002qr\u0007)\u0002\u0002rs\u0005\u0018",
	"\r\u0002st\u0007\u0012\u0002\u0002t\u0085\u0003\u0002\u0002\u0002uv",
	"\u0007\u0011\u0002\u0002vw\u0007)\u0002\u0002wx\u0007\u0006\u0002\u0002",
	"xy\u0007\u0007\u0002\u0002yz\u0005\u0018\r\u0002z{\u0007\u0012\u0002",
	"\u0002{\u0085\u0003\u0002\u0002\u0002|}\u0007\u0011\u0002\u0002}~\u0007",
	")\u0002\u0002~\u007f\u0007\u0006\u0002\u0002\u007f\u0080\u0005\u0018",
	"\r\u0002\u0080\u0081\u0007\u0007\u0002\u0002\u0081\u0082\u0005\u0018",
	"\r\u0002\u0082\u0083\u0007\u0012\u0002\u0002\u0083\u0085\u0003\u0002",
	"\u0002\u0002\u0084p\u0003\u0002\u0002\u0002\u0084u\u0003\u0002\u0002",
	"\u0002\u0084|\u0003\u0002\u0002\u0002\u0085\u000f\u0003\u0002\u0002",
	"\u0002\u0086\u008c\u0005\u0014\u000b\u0002\u0087\u0088\u0007\n\u0002",
	"\u0002\u0088\u0089\u0005\u0018\r\u0002\u0089\u008a\u0007\u0005\u0002",
	"\u0002\u008a\u008c\u0003\u0002\u0002\u0002\u008b\u0086\u0003\u0002\u0002",
	"\u0002\u008b\u0087\u0003\u0002\u0002\u0002\u008c\u008d\u0003\u0002\u0002",
	"\u0002\u008d\u008b\u0003\u0002\u0002\u0002\u008d\u008e\u0003\u0002\u0002",
	"\u0002\u008e\u0011\u0003\u0002\u0002\u0002\u008f\u009b\u0005\u0014\u000b",
	"\u0002\u0090\u0091\u0007\u0013\u0002\u0002\u0091\u0092\u0005\u001c\u000f",
	"\u0002\u0092\u0093\u0007\u0014\u0002\u0002\u0093\u0094\u0005\u001c\u000f",
	"\u0002\u0094\u0095\u0007\u0005\u0002\u0002\u0095\u009b\u0003\u0002\u0002",
	"\u0002\u0096\u0097\u0007\u0015\u0002\u0002\u0097\u0098\u0005\u001c\u000f",
	"\u0002\u0098\u0099\u0007\u0005\u0002\u0002\u0099\u009b\u0003\u0002\u0002",
	"\u0002\u009a\u008f\u0003\u0002\u0002\u0002\u009a\u0090\u0003\u0002\u0002",
	"\u0002\u009a\u0096\u0003\u0002\u0002\u0002\u009b\u0013\u0003\u0002\u0002",
	"\u0002\u009c\u009d\u0007\u0016\u0002\u0002\u009d\u009e\u0007\u0006\u0002",
	"\u0002\u009e\u009f\u0005\u001e\u0010\u0002\u009f\u00a0\u0007\u0007\u0002",
	"\u0002\u00a0\u00a1\u0005\u001c\u000f\u0002\u00a1\u00a2\u0007\u0005\u0002",
	"\u0002\u00a2\u00bb\u0003\u0002\u0002\u0002\u00a3\u00a4\u0007\u0017\u0002",
	"\u0002\u00a4\u00a5\u0005\u001c\u000f\u0002\u00a5\u00a6\u0007\u0018\u0002",
	"\u0002\u00a6\u00a7\u0005\u001c\u000f\u0002\u00a7\u00a8\u0007\u0005\u0002",
	"\u0002\u00a8\u00bb\u0003\u0002\u0002\u0002\u00a9\u00aa\u0007)\u0002",
	"\u0002\u00aa\u00ab\u0005\u0016\f\u0002\u00ab\u00ac\u0007\u0005\u0002",
	"\u0002\u00ac\u00bb\u0003\u0002\u0002\u0002\u00ad\u00ae\u0007)\u0002",
	"\u0002\u00ae\u00af\u0007\u0006\u0002\u0002\u00af\u00b0\u0007\u0007\u0002",
	"\u0002\u00b0\u00b1\u0005\u0016\f\u0002\u00b1\u00b2\u0007\u0005\u0002",
	"\u0002\u00b2\u00bb\u0003\u0002\u0002\u0002\u00b3\u00b4\u0007)\u0002",
	"\u0002\u00b4\u00b5\u0007\u0006\u0002\u0002\u00b5\u00b6\u0005\u001e\u0010",
	"\u0002\u00b6\u00b7\u0007\u0007\u0002\u0002\u00b7\u00b8\u0005\u0016\f",
	"\u0002\u00b8\u00b9\u0007\u0005\u0002\u0002\u00b9\u00bb\u0003\u0002\u0002",
	"\u0002\u00ba\u009c\u0003\u0002\u0002\u0002\u00ba\u00a3\u0003\u0002\u0002",
	"\u0002\u00ba\u00a9\u0003\u0002\u0002\u0002\u00ba\u00ad\u0003\u0002\u0002",
	"\u0002\u00ba\u00b3\u0003\u0002\u0002\u0002\u00bb\u0015\u0003\u0002\u0002",
	"\u0002\u00bc\u00bf\u0005\u0018\r\u0002\u00bd\u00bf\u0005\u001a\u000e",
	"\u0002\u00be\u00bc\u0003\u0002\u0002\u0002\u00be\u00bd\u0003\u0002\u0002",
	"\u0002\u00bf\u0017\u0003\u0002\u0002\u0002\u00c0\u00c1\u0007)\u0002",
	"\u0002\u00c1\u00c3\u0007\u0018\u0002\u0002\u00c2\u00c0\u0003\u0002\u0002",
	"\u0002\u00c3\u00c6\u0003\u0002\u0002\u0002\u00c4\u00c2\u0003\u0002\u0002",
	"\u0002\u00c4\u00c5\u0003\u0002\u0002\u0002\u00c5\u00c7\u0003\u0002\u0002",
	"\u0002\u00c6\u00c4\u0003\u0002\u0002\u0002\u00c7\u00c8\u0007)\u0002",
	"\u0002\u00c8\u0019\u0003\u0002\u0002\u0002\u00c9\u00ca\u0007)\u0002",
	"\u0002\u00ca\u00cb\u0007\u000e\u0002\u0002\u00cb\u00cc\u0007(\u0002",
	"\u0002\u00cc\u00cd\u0007\u000f\u0002\u0002\u00cd\u00cf\u0007\u0018\u0002",
	"\u0002\u00ce\u00c9\u0003\u0002\u0002\u0002\u00cf\u00d2\u0003\u0002\u0002",
	"\u0002\u00d0\u00ce\u0003\u0002\u0002\u0002\u00d0\u00d1\u0003\u0002\u0002",
	"\u0002\u00d1\u00d3\u0003\u0002\u0002\u0002\u00d2\u00d0\u0003\u0002\u0002",
	"\u0002\u00d3\u00f5\u0007)\u0002\u0002\u00d4\u00d5\u0007)\u0002\u0002",
	"\u00d5\u00d6\u0007\u000e\u0002\u0002\u00d6\u00d7\u0007(\u0002\u0002",
	"\u00d7\u00d8\u0007\u000f\u0002\u0002\u00d8\u00da\u0007\u0018\u0002\u0002",
	"\u00d9\u00d4\u0003\u0002\u0002\u0002\u00da\u00dd\u0003\u0002\u0002\u0002",
	"\u00db\u00d9\u0003\u0002\u0002\u0002\u00db\u00dc\u0003\u0002\u0002\u0002",
	"\u00dc\u00de\u0003\u0002\u0002\u0002\u00dd\u00db\u0003\u0002\u0002\u0002",
	"\u00de\u00df\u0007)\u0002\u0002\u00df\u00e0\u0007\u000e\u0002\u0002",
	"\u00e0\u00e1\u0007(\u0002\u0002\u00e1\u00f5\u0007\u000f\u0002\u0002",
	"\u00e2\u00e3\u0007)\u0002\u0002\u00e3\u00e5\u0007\u0018\u0002\u0002",
	"\u00e4\u00e2\u0003\u0002\u0002\u0002\u00e5\u00e8\u0003\u0002\u0002\u0002",
	"\u00e6\u00e4\u0003\u0002\u0002\u0002\u00e6\u00e7\u0003\u0002\u0002\u0002",
	"\u00e7\u00e9\u0003\u0002\u0002\u0002\u00e8\u00e6\u0003\u0002\u0002\u0002",
	"\u00e9\u00ea\u0007)\u0002\u0002\u00ea\u00ec\u0007\u0018\u0002\u0002",
	"\u00eb\u00e6\u0003\u0002\u0002\u0002\u00ec\u00ef\u0003\u0002\u0002\u0002",
	"\u00ed\u00eb\u0003\u0002\u0002\u0002\u00ed\u00ee\u0003\u0002\u0002\u0002",
	"\u00ee\u00f0\u0003\u0002\u0002\u0002\u00ef\u00ed\u0003\u0002\u0002\u0002",
	"\u00f0\u00f1\u0007)\u0002\u0002\u00f1\u00f2\u0007\u000e\u0002\u0002",
	"\u00f2\u00f3\u0007(\u0002\u0002\u00f3\u00f5\u0007\u000f\u0002\u0002",
	"\u00f4\u00d0\u0003\u0002\u0002\u0002\u00f4\u00db\u0003\u0002\u0002\u0002",
	"\u00f4\u00ed\u0003\u0002\u0002\u0002\u00f5\u001b\u0003\u0002\u0002\u0002",
	"\u00f6\u00fc\u0007)\u0002\u0002\u00f7\u00f8\u0007)\u0002\u0002\u00f8",
	"\u00f9\u0007\u000e\u0002\u0002\u00f9\u00fa\u0007(\u0002\u0002\u00fa",
	"\u00fc\u0007\u000f\u0002\u0002\u00fb\u00f6\u0003\u0002\u0002\u0002\u00fb",
	"\u00f7\u0003\u0002\u0002\u0002\u00fc\u001d\u0003\u0002\u0002\u0002\u00fd",
	"\u00fe\u0005 \u0011\u0002\u00fe\u00ff\u0007\u0018\u0002\u0002\u00ff",
	"\u0101\u0003\u0002\u0002\u0002\u0100\u00fd\u0003\u0002\u0002\u0002\u0101",
	"\u0104\u0003\u0002\u0002\u0002\u0102\u0100\u0003\u0002\u0002\u0002\u0102",
	"\u0103\u0003\u0002\u0002\u0002\u0103\u0105\u0003\u0002\u0002\u0002\u0104",
	"\u0102\u0003\u0002\u0002\u0002\u0105\u0106\u0005 \u0011\u0002\u0106",
	"\u001f\u0003\u0002\u0002\u0002\u0107\u0109\b\u0011\u0001\u0002\u0108",
	"\u010a\t\u0002\u0002\u0002\u0109\u0108\u0003\u0002\u0002\u0002\u0109",
	"\u010a\u0003\u0002\u0002\u0002\u010a\u010b\u0003\u0002\u0002\u0002\u010b",
	"\u010c\u0007\u0006\u0002\u0002\u010c\u010d\u0005 \u0011\u0002\u010d",
	"\u010e\u0007\u0007\u0002\u0002\u010e\u011c\u0003\u0002\u0002\u0002\u010f",
	"\u0111\t\u0002\u0002\u0002\u0110\u010f\u0003\u0002\u0002\u0002\u0110",
	"\u0111\u0003\u0002\u0002\u0002\u0111\u0112\u0003\u0002\u0002\u0002\u0112",
	"\u0113\u0005$\u0013\u0002\u0113\u0114\u0007\u0006\u0002\u0002\u0114",
	"\u0115\u0005 \u0011\u0002\u0115\u0116\u0007\u0007\u0002\u0002\u0116",
	"\u011c\u0003\u0002\u0002\u0002\u0117\u0119\t\u0002\u0002\u0002\u0118",
	"\u0117\u0003\u0002\u0002\u0002\u0118\u0119\u0003\u0002\u0002\u0002\u0119",
	'\u011a\u0003\u0002\u0002\u0002\u011a\u011c\u0005"\u0012\u0002\u011b',
	"\u0107\u0003\u0002\u0002\u0002\u011b\u0110\u0003\u0002\u0002\u0002\u011b",
	"\u0118\u0003\u0002\u0002\u0002\u011c\u0128\u0003\u0002\u0002\u0002\u011d",
	"\u011e\f\b\u0002\u0002\u011e\u011f\u0007\u0019\u0002\u0002\u011f\u0127",
	"\u0005 \u0011\t\u0120\u0121\f\u0007\u0002\u0002\u0121\u0122\t\u0003",
	"\u0002\u0002\u0122\u0127\u0005 \u0011\b\u0123\u0124\f\u0006\u0002\u0002",
	"\u0124\u0125\t\u0002\u0002\u0002\u0125\u0127\u0005 \u0011\u0007\u0126",
	"\u011d\u0003\u0002\u0002\u0002\u0126\u0120\u0003\u0002\u0002\u0002\u0126",
	"\u0123\u0003\u0002\u0002\u0002\u0127\u012a\u0003\u0002\u0002\u0002\u0128",
	"\u0126\u0003\u0002\u0002\u0002\u0128\u0129\u0003\u0002\u0002\u0002\u0129",
	"!\u0003\u0002\u0002\u0002\u012a\u0128\u0003\u0002\u0002\u0002\u012b",
	"\u012c\t\u0004\u0002\u0002\u012c#\u0003\u0002\u0002\u0002\u012d\u012e",
	"\t\u0005\u0002\u0002\u012e%\u0003\u0002\u0002\u0002\u0019*Vn\u0084\u008b",
	"\u008d\u009a\u00ba\u00be\u00c4\u00d0\u00db\u00e6\u00ed\u00f4\u00fb\u0102",
	"\u0109\u0110\u0118\u011b\u0126\u0128",
].join("");

const atn = new ATNDeserializer().deserialize(serializedATN);

const decisionsToDFA = atn.decisionToState.map(function (ds, index) {
	return new DFA(ds, index);
});

const sharedContextCache = new PredictionContextCache();

const literalNames = [
	null,
	"'}'",
	"'opaque'",
	"';'",
	"'('",
	"')'",
	"'if'",
	"'=='",
	"'barrier'",
	"'OPENQASM'",
	"'include'",
	"'qreg'",
	"'['",
	"']'",
	"'creg'",
	"'gate'",
	"'{'",
	"'measure'",
	"'->'",
	"'reset'",
	"'U'",
	"'CX'",
	"','",
	"'^'",
	"'*'",
	"'/'",
	"'+'",
	"'-'",
	"'sin'",
	"'cos'",
	"'tan'",
	"'exp'",
	"'ln'",
	"'sqrt'",
	"'pi'",
];

const symbolicNames = [
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	"PI",
	"REAL",
	"SUBREAL",
	"EXPREAL",
	"INT",
	"ID",
	"WS",
	"FILENAME",
	"COMMENT",
	"LINE_COMMENT",
];

const ruleNames = [
	"mainprog",
	"statement",
	"version",
	"include",
	"filename",
	"decl",
	"gatedecl",
	"goplist",
	"qop",
	"uop",
	"anylist",
	"idlist",
	"mixedlist",
	"argument",
	"explist",
	"exp",
	"atom",
	"unaryop",
];

export class QASMParser extends Parser {
	constructor(input) {
		super(input);
		this._interp = new ParserATNSimulator(
			this,
			atn,
			decisionsToDFA,
			sharedContextCache,
		);
		this.ruleNames = ruleNames;
		this.literalNames = literalNames;
		this.symbolicNames = symbolicNames;
	}

	decl = function () {
		const localctx = new DeclContext(this, this._ctx, this.state);
		this.enterRule(localctx, 10, QASMParser.RULE_decl);
		try {
			this.state = 108;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
				case QASMParser.T__10:
					this.enterOuterAlt(localctx, 1);
					this.state = 96;
					this.match(QASMParser.T__10);
					this.state = 97;
					this.match(QASMParser.ID);
					this.state = 98;
					this.match(QASMParser.T__11);
					this.state = 99;
					this.match(QASMParser.INT);
					this.state = 100;
					this.match(QASMParser.T__12);
					this.state = 101;
					this.match(QASMParser.T__2);
					break;
				case QASMParser.T__13:
					this.enterOuterAlt(localctx, 2);
					this.state = 102;
					this.match(QASMParser.T__13);
					this.state = 103;
					this.match(QASMParser.ID);
					this.state = 104;
					this.match(QASMParser.T__11);
					this.state = 105;
					this.match(QASMParser.INT);
					this.state = 106;
					this.match(QASMParser.T__12);
					this.state = 107;
					this.match(QASMParser.T__2);
					break;
				default:
					throw new NoViableAltException(this);
			}
		} catch (re) {
			if (re instanceof RecognitionException) {
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
	}.bind(this);

	mainprog = function () {
		const localctx = new MainprogContext(this, this._ctx, this.state);
		this.enterRule(localctx, 0, QASMParser.RULE_mainprog);
		let _la = 0; // Token type
		try {
			this.enterOuterAlt(localctx, 1);
			this.state = 36;
			this.version();
			this.state = 40;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (
				((_la & ~0x1f) === 0 &&
					((1 << _la) &
						((1 << QASMParser.T__1) |
							(1 << QASMParser.T__5) |
							(1 << QASMParser.T__7) |
							(1 << QASMParser.T__9) |
							(1 << QASMParser.T__10) |
							(1 << QASMParser.T__13) |
							(1 << QASMParser.T__14) |
							(1 << QASMParser.T__16) |
							(1 << QASMParser.T__18) |
							(1 << QASMParser.T__19) |
							(1 << QASMParser.T__20))) !==
						0) ||
				_la === QASMParser.ID
			) {
				this.state = 37;
				this.statement();
				this.state = 42;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
		} catch (re) {
			if (re instanceof RecognitionException) {
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
	}.bind(this);

	atom = function () {
		const localctx = new AtomContext(this, this._ctx, this.state);
		this.enterRule(localctx, 32, QASMParser.RULE_atom);
		let _la = 0; // Token type
		try {
			this.enterOuterAlt(localctx, 1);
			this.state = 297;
			_la = this._input.LA(1);
			if (
				!(
					((_la - 34) & ~0x1f) === 0 &&
					((1 << (_la - 34)) &
						((1 << (QASMParser.PI - 34)) |
							(1 << (QASMParser.REAL - 34)) |
							(1 << (QASMParser.INT - 34)) |
							(1 << (QASMParser.ID - 34)))) !==
						0
				)
			) {
				this._errHandler.recoverInline(this);
			} else {
				this._errHandler.reportMatch(this);
				this.consume();
			}
		} catch (re) {
			if (re instanceof RecognitionException) {
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
	}.bind(this);

	unaryop = function () {
		const localctx = new UnaryopContext(this, this._ctx, this.state);
		this.enterRule(localctx, 34, QASMParser.RULE_unaryop);
		let _la = 0; // Token type
		try {
			this.enterOuterAlt(localctx, 1);
			this.state = 299;
			_la = this._input.LA(1);
			if (
				!(
					((_la - 28) & ~0x1f) === 0 &&
					((1 << (_la - 28)) &
						((1 << (QASMParser.T__27 - 28)) |
							(1 << (QASMParser.T__28 - 28)) |
							(1 << (QASMParser.T__29 - 28)) |
							(1 << (QASMParser.T__30 - 28)) |
							(1 << (QASMParser.T__31 - 28)) |
							(1 << (QASMParser.T__32 - 28)))) !==
						0
				)
			) {
				this._errHandler.recoverInline(this);
			} else {
				this._errHandler.reportMatch(this);
				this.consume();
			}
		} catch (re) {
			if (re instanceof RecognitionException) {
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
	}.bind(this);

	sempred = function (localctx, ruleIndex, predIndex) {
		switch (ruleIndex) {
			case 15:
				return this.exp_sempred(localctx, predIndex);
			default:
				throw "No predicate with index:" + ruleIndex;
		}
	}.bind(this);

	exp_sempred = function (localctx, predIndex) {
		switch (predIndex) {
			case 0:
				return this.precpred(this._ctx, 6);
			case 1:
				return this.precpred(this._ctx, 5);
			case 2:
				return this.precpred(this._ctx, 4);
			default:
				throw "No predicate with index:" + predIndex;
		}
	}.bind(this);

	qop = function () {
		const localctx = new QopContext(this, this._ctx, this.state);
		this.enterRule(localctx, 16, QASMParser.RULE_qop);
		try {
			this.state = 152;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
				case QASMParser.T__19:
				case QASMParser.T__20:
				case QASMParser.ID:
					this.enterOuterAlt(localctx, 1);
					this.state = 141;
					this.uop();
					break;
				case QASMParser.T__16:
					this.enterOuterAlt(localctx, 2);
					this.state = 142;
					this.match(QASMParser.T__16);
					this.state = 143;
					this.argument();
					this.state = 144;
					this.match(QASMParser.T__17);
					this.state = 145;
					this.argument();
					this.state = 146;
					this.match(QASMParser.T__2);
					break;
				case QASMParser.T__18:
					this.enterOuterAlt(localctx, 3);
					this.state = 148;
					this.match(QASMParser.T__18);
					this.state = 149;
					this.argument();
					this.state = 150;
					this.match(QASMParser.T__2);
					break;
				default:
					throw new NoViableAltException(this);
			}
		} catch (re) {
			if (re instanceof RecognitionException) {
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
	}.bind(this);

	exp = function (_p) {
		if (_p === undefined) {
			_p = 0;
		}
		const _parentctx = this._ctx;
		const _parentState = this.state;
		let localctx = new ExpContext(this, this._ctx, _parentState);
		let _prevctx = localctx;
		const _startState = 30;
		this.enterRecursionRule(localctx, 30, QASMParser.RULE_exp, _p);
		let _la = 0; // Token type
		try {
			this.enterOuterAlt(localctx, 1);
			this.state = 281;
			this._errHandler.sync(this);
			const la_ = this._interp.adaptivePredict(this._input, 20, this._ctx);
			switch (la_) {
				case 1:
					this.state = 263;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					if (_la === QASMParser.T__25 || _la === QASMParser.T__26) {
						this.state = 262;
						_la = this._input.LA(1);
						if (!(_la === QASMParser.T__25 || _la === QASMParser.T__26)) {
							this._errHandler.recoverInline(this);
						} else {
							this._errHandler.reportMatch(this);
							this.consume();
						}
					}

					this.state = 265;
					this.match(QASMParser.T__3);
					this.state = 266;
					this.exp(0);
					this.state = 267;
					this.match(QASMParser.T__4);
					break;

				case 2:
					this.state = 270;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					if (_la === QASMParser.T__25 || _la === QASMParser.T__26) {
						this.state = 269;
						_la = this._input.LA(1);
						if (!(_la === QASMParser.T__25 || _la === QASMParser.T__26)) {
							this._errHandler.recoverInline(this);
						} else {
							this._errHandler.reportMatch(this);
							this.consume();
						}
					}

					this.state = 272;
					this.unaryop();
					this.state = 273;
					this.match(QASMParser.T__3);
					this.state = 274;
					this.exp(0);
					this.state = 275;
					this.match(QASMParser.T__4);
					break;

				case 3:
					this.state = 278;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					if (_la === QASMParser.T__25 || _la === QASMParser.T__26) {
						this.state = 277;
						_la = this._input.LA(1);
						if (!(_la === QASMParser.T__25 || _la === QASMParser.T__26)) {
							this._errHandler.recoverInline(this);
						} else {
							this._errHandler.reportMatch(this);
							this.consume();
						}
					}

					this.state = 280;
					this.atom();
					break;
			}
			this._ctx.stop = this._input.LT(-1);
			this.state = 294;
			this._errHandler.sync(this);
			let _alt = this._interp.adaptivePredict(this._input, 22, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners !== null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = localctx;
					this.state = 292;
					this._errHandler.sync(this);
					const la_ = this._interp.adaptivePredict(this._input, 21, this._ctx);
					switch (la_) {
						case 1:
							localctx = new ExpContext(this, _parentctx, _parentState);
							this.pushNewRecursionContext(
								localctx,
								_startState,
								QASMParser.RULE_exp,
							);
							this.state = 283;
							if (!this.precpred(this._ctx, 6)) {
								throw new FailedPredicateException(
									this,
									"this.precpred(this._ctx, 6)",
									undefined,
								);
							}
							this.state = 284;
							this.match(QASMParser.T__22);
							this.state = 285;
							this.exp(7);
							break;

						case 2:
							localctx = new ExpContext(this, _parentctx, _parentState);
							this.pushNewRecursionContext(
								localctx,
								_startState,
								QASMParser.RULE_exp,
							);
							this.state = 286;
							if (!this.precpred(this._ctx, 5)) {
								throw new FailedPredicateException(
									this,
									"this.precpred(this._ctx, 5)",
									undefined,
								);
							}
							this.state = 287;
							_la = this._input.LA(1);
							if (!(_la === QASMParser.T__23 || _la === QASMParser.T__24)) {
								this._errHandler.recoverInline(this);
							} else {
								this._errHandler.reportMatch(this);
								this.consume();
							}
							this.state = 288;
							this.exp(6);
							break;

						case 3:
							localctx = new ExpContext(this, _parentctx, _parentState);
							this.pushNewRecursionContext(
								localctx,
								_startState,
								QASMParser.RULE_exp,
							);
							this.state = 289;
							if (!this.precpred(this._ctx, 4)) {
								throw new FailedPredicateException(
									this,
									"this.precpred(this._ctx, 4)",
									undefined,
								);
							}
							this.state = 290;
							_la = this._input.LA(1);
							if (!(_la === QASMParser.T__25 || _la === QASMParser.T__26)) {
								this._errHandler.recoverInline(this);
							} else {
								this._errHandler.reportMatch(this);
								this.consume();
							}
							this.state = 291;
							this.exp(5);
							break;
					}
				}
				this.state = 296;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 22, this._ctx);
			}
		} catch (error) {
			if (error instanceof RecognitionException) {
				localctx.exception = error;
				this._errHandler.reportError(this, error);
				this._errHandler.recover(this, error);
			} else {
				throw error;
			}
		} finally {
			this.unrollRecursionContexts(_parentctx);
		}
		return localctx;
	}.bind(this);

	statement = function () {
		const localctx = new StatementContext(this, this._ctx, this.state);
		this.enterRule(localctx, 2, QASMParser.RULE_statement);
		try {
			this.state = 84;
			this._errHandler.sync(this);
			const la_ = this._interp.adaptivePredict(this._input, 1, this._ctx);
			switch (la_) {
				case 1:
					this.enterOuterAlt(localctx, 1);
					this.state = 43;
					this.decl();
					break;

				case 2:
					this.enterOuterAlt(localctx, 2);
					this.state = 44;
					this.gatedecl();
					this.state = 45;
					this.goplist();
					this.state = 46;
					this.match(QASMParser.T__0);
					break;

				case 3:
					this.enterOuterAlt(localctx, 3);
					this.state = 48;
					this.gatedecl();
					this.state = 49;
					this.match(QASMParser.T__0);
					break;

				case 4:
					this.enterOuterAlt(localctx, 4);
					this.state = 51;
					this.match(QASMParser.T__1);
					this.state = 52;
					this.match(QASMParser.ID);
					this.state = 53;
					this.idlist();
					this.state = 54;
					this.match(QASMParser.T__2);
					break;

				case 5:
					this.enterOuterAlt(localctx, 5);
					this.state = 56;
					this.match(QASMParser.T__1);
					this.state = 57;
					this.match(QASMParser.ID);
					this.state = 58;
					this.match(QASMParser.T__3);
					this.state = 59;
					this.match(QASMParser.T__4);
					this.state = 60;
					this.idlist();
					this.state = 61;
					this.match(QASMParser.T__2);
					break;

				case 6:
					this.enterOuterAlt(localctx, 6);
					this.state = 63;
					this.match(QASMParser.T__1);
					this.state = 64;
					this.match(QASMParser.ID);
					this.state = 65;
					this.match(QASMParser.T__3);
					this.state = 66;
					this.idlist();
					this.state = 67;
					this.match(QASMParser.T__4);
					this.state = 68;
					this.idlist();
					this.state = 69;
					this.match(QASMParser.T__2);
					break;

				case 7:
					this.enterOuterAlt(localctx, 7);
					this.state = 71;
					this.qop();
					break;

				case 8:
					this.enterOuterAlt(localctx, 8);
					this.state = 72;
					this.match(QASMParser.T__5);
					this.state = 73;
					this.match(QASMParser.T__3);
					this.state = 74;
					this.match(QASMParser.ID);
					this.state = 75;
					this.match(QASMParser.T__6);
					this.state = 76;
					this.match(QASMParser.INT);
					this.state = 77;
					this.match(QASMParser.T__4);
					this.state = 78;
					this.qop();
					break;

				case 9:
					this.enterOuterAlt(localctx, 9);
					this.state = 79;
					this.match(QASMParser.T__7);
					this.state = 80;
					this.anylist();
					this.state = 81;
					this.match(QASMParser.T__2);
					break;

				case 10:
					this.enterOuterAlt(localctx, 10);
					this.state = 83;
					this.include();
					break;
			}
		} catch (re) {
			if (re instanceof RecognitionException) {
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
	}.bind(this);
}

Object.defineProperty(QASMParser.prototype, "atn", {
	get: function () {
		return atn;
	},
});

QASMParser.EOF = Token.EOF;
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
QASMParser.PI = 34;
QASMParser.REAL = 35;
QASMParser.SUBREAL = 36;
QASMParser.EXPREAL = 37;
QASMParser.INT = 38;
QASMParser.ID = 39;
QASMParser.WS = 40;
QASMParser.FILENAME = 41;
QASMParser.COMMENT = 42;
QASMParser.LINE_COMMENT = 43;

QASMParser.RULE_mainprog = 0;
QASMParser.RULE_statement = 1;
QASMParser.RULE_version = 2;
QASMParser.RULE_include = 3;
QASMParser.RULE_filename = 4;
QASMParser.RULE_decl = 5;
QASMParser.RULE_gatedecl = 6;
QASMParser.RULE_goplist = 7;
QASMParser.RULE_qop = 8;
QASMParser.RULE_uop = 9;
QASMParser.RULE_anylist = 10;
QASMParser.RULE_idlist = 11;
QASMParser.RULE_mixedlist = 12;
QASMParser.RULE_argument = 13;
QASMParser.RULE_explist = 14;
QASMParser.RULE_exp = 15;
QASMParser.RULE_atom = 16;
QASMParser.RULE_unaryop = 17;

class MainprogContext extends ParserRuleContext {
	constructor(parser, parent, invokingState) {
		if (parent === undefined) {
			parent = null;
		}
		if (invokingState === undefined || invokingState === null) {
			invokingState = -1;
		}
		super(parent, invokingState);
		this.contextType = "MainprogContext";
		this.parser = parser;
		this.ruleIndex = QASMParser.RULE_mainprog;
	}

	version = function () {
		return this.getTypedRuleContext(VersionContext, 0);
	}.bind(this);
	statement = function (i) {
		if (i === undefined) {
			i = null;
		}
		if (i === null) {
			return this.getTypedRuleContexts(StatementContext);
		} else {
			return this.getTypedRuleContext(StatementContext, i);
		}
	}.bind(this);
	enterRule = function (listener) {
		if (listener instanceof QASMListener) {
			listener.enterMainprog(this);
		}
	}.bind(this);
	exitRule = function (listener) {
		if (listener instanceof QASMListener) {
			listener.exitMainprog(this);
		}
	}.bind(this);
}

QASMParser.MainprogContext = MainprogContext;

class StatementContext extends ParserRuleContext {
	constructor(parser, parent, invokingState) {
		if (parent === undefined) {
			parent = null;
		}
		if (invokingState === undefined || invokingState === null) {
			invokingState = -1;
		}
		super(parent, invokingState);
		this.parser = parser;
		this.ruleIndex = QASMParser.RULE_statement;
	}

	decl = function () {
		return this.getTypedRuleContext(DeclContext, 0);
	}.bind(this);

	gatedecl = function () {
		return this.getTypedRuleContext(GatedeclContext, 0);
	}.bind(this);

	goplist = function () {
		return this.getTypedRuleContext(GoplistContext, 0);
	}.bind(this);

	ID = function () {
		return this.getToken(QASMParser.ID, 0);
	}.bind(this);

	idlist = function (i) {
		if (i === undefined) {
			i = null;
		}
		if (i === null) {
			return this.getTypedRuleContexts(IdlistContext);
		} else {
			return this.getTypedRuleContext(IdlistContext, i);
		}
	}.bind(this);

	qop = function () {
		return this.getTypedRuleContext(QopContext, 0);
	}.bind(this);

	INT = function () {
		return this.getToken(QASMParser.INT, 0);
	}.bind(this);

	anylist = function () {
		return this.getTypedRuleContext(AnylistContext, 0);
	}.bind(this);

	include = function () {
		return this.getTypedRuleContext(IncludeContext, 0);
	};

	enterRule = function (listener) {
		if (listener instanceof QASMListener) {
			listener.enterStatement(this);
		}
	}.bind(this);

	exitRule = function (listener) {
		if (listener instanceof QASMListener) {
			listener.exitStatement(this);
		}
	}.bind(this);
}

QASMParser.StatementContext = StatementContext;

class VersionContext extends ParserRuleContext {
	constructor(parser, parent, invokingState) {
		if (parent === undefined) {
			parent = null;
		}
		if (invokingState === undefined || invokingState === null) {
			invokingState = -1;
		}
		super(parent, invokingState);
		this.contextType = "VersionContext";
		this.parser = parser;
		this.ruleIndex = QASMParser.RULE_version;
	}

	REAL = function () {
		return this.getToken(QASMParser.REAL, 0);
	}.bind(this);

	enterRule = function (listener) {
		if (listener instanceof QASMListener) {
			listener.enterVersion(this);
		}
	}.bind(this);

	exitRule = function (listener) {
		if (listener instanceof QASMListener) {
			listener.exitVersion(this);
		}
	}.bind(this);
}

QASMParser.VersionContext = VersionContext;

QASMParser.prototype.version = function () {
	const localctx = new VersionContext(this, this._ctx, this.state);
	this.enterRule(localctx, 4, QASMParser.RULE_version);
	try {
		this.enterOuterAlt(localctx, 1);
		this.state = 86;
		this.match(QASMParser.T__8);
		this.state = 87;
		this.match(QASMParser.REAL);
		this.state = 88;
		this.match(QASMParser.T__2);
	} catch (re) {
		if (re instanceof RecognitionException) {
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

class IncludeContext extends ParserRuleContext {
	constructor(parser, parent, invokingState) {
		if (parent === undefined) {
			parent = null;
		}
		if (invokingState === undefined || invokingState === null) {
			invokingState = -1;
		}
		super(parent, invokingState);
		this.parser = parser;
		this.ruleIndex = QASMParser.RULE_include;
	}

	filename = function () {
		return this.getTypedRuleContext(FilenameContext, 0);
	}.bind(this);

	enterRule = function (listener) {
		if (listener instanceof QASMListener) {
			listener.enterInclude(this);
		}
	}.bind(this);

	exitRule = function (listener) {
		if (listener instanceof QASMListener) {
			listener.exitInclude(this);
		}
	}.bind(this);
}

QASMParser.IncludeContext = IncludeContext;

QASMParser.prototype.include = function () {
	const localctx = new IncludeContext(this, this._ctx, this.state);
	this.enterRule(localctx, 6, QASMParser.RULE_include);
	try {
		this.enterOuterAlt(localctx, 1);
		this.state = 90;
		this.match(QASMParser.T__9);
		this.state = 91;
		this.filename();
		this.state = 92;
		this.match(QASMParser.T__2);
	} catch (re) {
		if (re instanceof RecognitionException) {
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

class FilenameContext extends ParserRuleContext {
	constructor(parser, parent, invokingState) {
		if (parent === undefined) {
			parent = null;
		}
		if (invokingState === undefined || invokingState === null) {
			invokingState = -1;
		}
		super(parent, invokingState);
		this.parser = parser;
		this.ruleIndex = QASMParser.RULE_filename;
	}

	FILENAME = function () {
		return this.getToken(QASMParser.FILENAME, 0);
	}.bind(this);

	enterRule = function (listener) {
		if (listener instanceof QASMListener) {
			listener.enterFilename(this);
		}
	}.bind(this);

	exitRule = function (listener) {
		if (listener instanceof QASMListener) {
			listener.exitFilename(this);
		}
	}.bind(this);
}

QASMParser.FilenameContext = FilenameContext;

QASMParser.prototype.filename = function () {
	const localctx = new FilenameContext(this, this._ctx, this.state);
	this.enterRule(localctx, 8, QASMParser.RULE_filename);
	try {
		this.enterOuterAlt(localctx, 1);
		this.state = 94;
		this.match(QASMParser.FILENAME);
	} catch (re) {
		if (re instanceof RecognitionException) {
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

class DeclContext extends ParserRuleContext {
	constructor(parser, parent, invokingState) {
		if (parent === undefined) {
			parent = null;
		}
		if (invokingState === undefined || invokingState === null) {
			invokingState = -1;
		}
		super(parent, invokingState);
		this.parser = parser;
		this.ruleIndex = QASMParser.RULE_decl;
	}

	ID = function () {
		return this.getToken(QASMParser.ID, 0);
	}.bind(this);

	INT = function () {
		return this.getToken(QASMParser.INT, 0);
	}.bind(this);

	enterRule = function (listener) {
		if (listener instanceof QASMListener) {
			listener.enterDecl(this);
		}
	}.bind(this);

	exitRule = function (listener) {
		if (listener instanceof QASMListener) {
			listener.exitDecl(this);
		}
	}.bind(this);
}

QASMParser.DeclContext = DeclContext;

class GatedeclContext extends ParserRuleContext {
	constructor(parser, parent, invokingState) {
		if (parent === undefined) {
			parent = null;
		}
		if (invokingState === undefined || invokingState === null) {
			invokingState = -1;
		}
		super(parent, invokingState);
		this.parser = parser;
		this.ruleIndex = QASMParser.RULE_gatedecl;
	}

	ID = function () {
		return this.getToken(QASMParser.ID, 0);
	};

	idlist = function (i) {
		if (i === undefined) {
			i = null;
		}
		if (i === null) {
			return this.getTypedRuleContexts(IdlistContext);
		} else {
			return this.getTypedRuleContext(IdlistContext, i);
		}
	};

	enterRule = function (listener) {
		if (listener instanceof QASMListener) {
			listener.enterGatedecl(this);
		}
	};

	exitRule = function (listener) {
		if (listener instanceof QASMListener) {
			listener.exitGatedecl(this);
		}
	};
}

QASMParser.GatedeclContext = GatedeclContext;

QASMParser.prototype.gatedecl = function () {
	const localctx = new GatedeclContext(this, this._ctx, this.state);
	this.enterRule(localctx, 12, QASMParser.RULE_gatedecl);
	try {
		this.state = 130;
		this._errHandler.sync(this);
		const la_ = this._interp.adaptivePredict(this._input, 3, this._ctx);
		switch (la_) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				this.state = 110;
				this.match(QASMParser.T__14);
				this.state = 111;
				this.match(QASMParser.ID);
				this.state = 112;
				this.idlist();
				this.state = 113;
				this.match(QASMParser.T__15);
				break;

			case 2:
				this.enterOuterAlt(localctx, 2);
				this.state = 115;
				this.match(QASMParser.T__14);
				this.state = 116;
				this.match(QASMParser.ID);
				this.state = 117;
				this.match(QASMParser.T__3);
				this.state = 118;
				this.match(QASMParser.T__4);
				this.state = 119;
				this.idlist();
				this.state = 120;
				this.match(QASMParser.T__15);
				break;

			case 3:
				this.enterOuterAlt(localctx, 3);
				this.state = 122;
				this.match(QASMParser.T__14);
				this.state = 123;
				this.match(QASMParser.ID);
				this.state = 124;
				this.match(QASMParser.T__3);
				this.state = 125;
				this.idlist();
				this.state = 126;
				this.match(QASMParser.T__4);
				this.state = 127;
				this.idlist();
				this.state = 128;
				this.match(QASMParser.T__15);
				break;
		}
	} catch (re) {
		if (re instanceof RecognitionException) {
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

class GoplistContext extends ParserRuleContext {
	constructor(parser, parent, invokingState) {
		if (parent === undefined) {
			parent = null;
		}
		if (invokingState === undefined || invokingState === null) {
			invokingState = -1;
		}
		super(parent, invokingState);
		this.parser = parser;
		this.ruleIndex = QASMParser.RULE_goplist;
	}

	uop = function (i) {
		if (i === undefined) {
			i = null;
		}
		if (i === null) {
			return this.getTypedRuleContexts(UopContext);
		} else {
			return this.getTypedRuleContext(UopContext, i);
		}
	};

	idlist = function (i) {
		if (i === undefined) {
			i = null;
		}
		if (i === null) {
			return this.getTypedRuleContexts(IdlistContext);
		} else {
			return this.getTypedRuleContext(IdlistContext, i);
		}
	};

	enterRule = function (listener) {
		if (listener instanceof QASMListener) {
			listener.enterGoplist(this);
		}
	};

	exitRule = function (listener) {
		if (listener instanceof QASMListener) {
			listener.exitGoplist(this);
		}
	};
}

QASMParser.GoplistContext = GoplistContext;

QASMParser.prototype.goplist = function () {
	const localctx = new GoplistContext(this, this._ctx, this.state);
	this.enterRule(localctx, 14, QASMParser.RULE_goplist);
	let _la = 0; // Token type
	try {
		this.enterOuterAlt(localctx, 1);
		this.state = 137;
		this._errHandler.sync(this);
		_la = this._input.LA(1);
		do {
			this.state = 137;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
				case QASMParser.T__19:
				case QASMParser.T__20:
				case QASMParser.ID:
					this.state = 132;
					this.uop();
					break;
				case QASMParser.T__7:
					this.state = 133;
					this.match(QASMParser.T__7);
					this.state = 134;
					this.idlist();
					this.state = 135;
					this.match(QASMParser.T__2);
					break;
				default:
					throw new NoViableAltException(this);
			}
			this.state = 139;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
		} while (
			((_la - 8) & ~0x1f) === 0 &&
			((1 << (_la - 8)) &
				((1 << (QASMParser.T__7 - 8)) |
					(1 << (QASMParser.T__19 - 8)) |
					(1 << (QASMParser.T__20 - 8)) |
					(1 << (QASMParser.ID - 8)))) !==
				0
		);
	} catch (re) {
		if (re instanceof RecognitionException) {
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

class QopContext extends ParserRuleContext {
	constructor(parser, parent, invokingState) {
		if (parent === undefined) {
			parent = null;
		}
		if (invokingState === undefined || invokingState === null) {
			invokingState = -1;
		}
		super(parent, invokingState);
		this.parser = parser;
		this.ruleIndex = QASMParser.RULE_qop;
		return this;
	}

	uop = function () {
		return this.getTypedRuleContext(UopContext, 0);
	}.bind(this);

	argument = function (i) {
		if (i === undefined) {
			i = null;
		}
		if (i === null) {
			return this.getTypedRuleContexts(ArgumentContext);
		} else {
			return this.getTypedRuleContext(ArgumentContext, i);
		}
	}.bind(this);

	enterRule = function (listener) {
		if (listener instanceof QASMListener) {
			listener.enterQop(this);
		}
	}.bind(this);

	exitRule = function (listener) {
		if (listener instanceof QASMListener) {
			listener.exitQop(this);
		}
	}.bind(this);
}

QASMParser.QopContext = QopContext;

class UopContext extends ParserRuleContext {
	constructor(parser, parent, invokingState) {
		if (parent === undefined) {
			parent = null;
		}
		if (invokingState === undefined || invokingState === null) {
			invokingState = -1;
		}
		super(parent, invokingState);
		this.parser = parser;
		this.ruleIndex = QASMParser.RULE_uop;
		return this;
	}

	explist = function () {
		return this.getTypedRuleContext(ExplistContext, 0);
	}.bind(this);

	argument = function (i) {
		if (i === undefined) {
			i = null;
		}
		if (i === null) {
			return this.getTypedRuleContexts(ArgumentContext);
		} else {
			return this.getTypedRuleContext(ArgumentContext, i);
		}
	}.bind(this);

	ID = function () {
		return this.getToken(QASMParser.ID, 0);
	}.bind(this);

	anylist = function () {
		return this.getTypedRuleContext(AnylistContext, 0);
	}.bind(this);

	enterRule = function (listener) {
		if (listener instanceof QASMListener) {
			listener.enterUop(this);
		}
	}.bind(this);

	exitRule = function (listener) {
		if (listener instanceof QASMListener) {
			listener.exitUop(this);
		}
	};
}

QASMParser.UopContext = UopContext;

QASMParser.prototype.uop = function () {
	const localctx = new UopContext(this, this._ctx, this.state);
	this.enterRule(localctx, 18, QASMParser.RULE_uop);
	try {
		this.state = 184;
		this._errHandler.sync(this);
		const la_ = this._interp.adaptivePredict(this._input, 7, this._ctx);
		switch (la_) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				this.state = 154;
				this.match(QASMParser.T__19);
				this.state = 155;
				this.match(QASMParser.T__3);
				this.state = 156;
				this.explist();
				this.state = 157;
				this.match(QASMParser.T__4);
				this.state = 158;
				this.argument();
				this.state = 159;
				this.match(QASMParser.T__2);
				break;

			case 2:
				this.enterOuterAlt(localctx, 2);
				this.state = 161;
				this.match(QASMParser.T__20);
				this.state = 162;
				this.argument();
				this.state = 163;
				this.match(QASMParser.T__21);
				this.state = 164;
				this.argument();
				this.state = 165;
				this.match(QASMParser.T__2);
				break;

			case 3:
				this.enterOuterAlt(localctx, 3);
				this.state = 167;
				this.match(QASMParser.ID);
				this.state = 168;
				this.anylist();
				this.state = 169;
				this.match(QASMParser.T__2);
				break;

			case 4:
				this.enterOuterAlt(localctx, 4);
				this.state = 171;
				this.match(QASMParser.ID);
				this.state = 172;
				this.match(QASMParser.T__3);
				this.state = 173;
				this.match(QASMParser.T__4);
				this.state = 174;
				this.anylist();
				this.state = 175;
				this.match(QASMParser.T__2);
				break;

			case 5:
				this.enterOuterAlt(localctx, 5);
				this.state = 177;
				this.match(QASMParser.ID);
				this.state = 178;
				this.match(QASMParser.T__3);
				this.state = 179;
				this.explist();
				this.state = 180;
				this.match(QASMParser.T__4);
				this.state = 181;
				this.anylist();
				this.state = 182;
				this.match(QASMParser.T__2);
				break;
		}
	} catch (re) {
		if (re instanceof RecognitionException) {
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

class AnylistContext extends ParserRuleContext {
	constructor(parser, parent, invokingState) {
		if (parent === undefined) {
			parent = null;
		}
		if (invokingState === undefined || invokingState === null) {
			invokingState = -1;
		}
		super(parent, invokingState);
		this.parser = parser;
		this.ruleIndex = QASMParser.RULE_anylist;
	}

	idlist = function () {
		return this.getTypedRuleContext(IdlistContext, 0);
	};

	mixedlist = function () {
		return this.getTypedRuleContext(MixedlistContext, 0);
	};

	enterRule = function (listener) {
		if (listener instanceof QASMListener) {
			listener.enterAnylist(this);
		}
	};

	exitRule = function (listener) {
		if (listener instanceof QASMListener) {
			listener.exitAnylist(this);
		}
	};
}

QASMParser.AnylistContext = AnylistContext;

QASMParser.prototype.anylist = function () {
	const localctx = new AnylistContext(this, this._ctx, this.state);
	this.enterRule(localctx, 20, QASMParser.RULE_anylist);
	try {
		this.state = 188;
		this._errHandler.sync(this);
		const la_ = this._interp.adaptivePredict(this._input, 8, this._ctx);
		switch (la_) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				this.state = 186;
				this.idlist();
				break;

			case 2:
				this.enterOuterAlt(localctx, 2);
				this.state = 187;
				this.mixedlist();
				break;
		}
	} catch (re) {
		if (re instanceof RecognitionException) {
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

class IdlistContext extends ParserRuleContext {
	constructor(parser, parent, invokingState) {
		if (parent === undefined) {
			parent = null;
		}
		if (invokingState === undefined || invokingState === null) {
			invokingState = -1;
		}
		super(parent, invokingState);
		this.parser = parser;
		this.ruleIndex = QASMParser.RULE_idlist;
	}

	ID = function (i) {
		if (i === undefined) {
			i = null;
		}
		if (i === null) {
			return this.getTokens(QASMParser.ID);
		} else {
			return this.getToken(QASMParser.ID, i);
		}
	};

	enterRule = function (listener) {
		if (listener instanceof QASMListener) {
			listener.enterIdlist(this);
		}
	};

	exitRule = function (listener) {
		if (listener instanceof QASMListener) {
			listener.exitIdlist(this);
		}
	};
}

QASMParser.IdlistContext = IdlistContext;

QASMParser.prototype.idlist = function () {
	const localctx = new IdlistContext(this, this._ctx, this.state);
	this.enterRule(localctx, 22, QASMParser.RULE_idlist);
	try {
		this.enterOuterAlt(localctx, 1);
		this.state = 194;
		this._errHandler.sync(this);
		let _alt = this._interp.adaptivePredict(this._input, 9, this._ctx);
		while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
			if (_alt === 1) {
				this.state = 190;
				this.match(QASMParser.ID);
				this.state = 191;
				this.match(QASMParser.T__21);
			}
			this.state = 196;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 9, this._ctx);
		}

		this.state = 197;
		this.match(QASMParser.ID);
	} catch (re) {
		if (re instanceof RecognitionException) {
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

class MixedlistContext extends ParserRuleContext {
	constructor(parser, parent, invokingState) {
		if (parent === undefined) {
			parent = null;
		}
		if (invokingState === undefined || invokingState === null) {
			invokingState = -1;
		}
		super(parent, invokingState);
		this.parser = parser;
		this.ruleIndex = QASMParser.RULE_mixedlist;
	}

	ID = function (i) {
		if (i === undefined) {
			i = null;
		}
		if (i === null) {
			return this.getTokens(QASMParser.ID);
		} else {
			return this.getToken(QASMParser.ID, i);
		}
	};

	INT = function (i) {
		if (i === undefined) {
			i = null;
		}
		if (i === null) {
			return this.getTokens(QASMParser.INT);
		} else {
			return this.getToken(QASMParser.INT, i);
		}
	};

	enterRule = function (listener) {
		if (listener instanceof QASMListener) {
			listener.enterMixedlist(this);
		}
	};

	exitRule = function (listener) {
		if (listener instanceof QASMListener) {
			listener.exitMixedlist(this);
		}
	};
}

QASMParser.MixedlistContext = MixedlistContext;

QASMParser.prototype.mixedlist = function () {
	const localctx = new MixedlistContext(this, this._ctx, this.state);
	this.enterRule(localctx, 24, QASMParser.RULE_mixedlist);
	try {
		this.state = 242;
		this._errHandler.sync(this);
		const la_ = this._interp.adaptivePredict(this._input, 14, this._ctx);
		let _alt;
		switch (la_) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				this.state = 206;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 10, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						this.state = 199;
						this.match(QASMParser.ID);
						this.state = 200;
						this.match(QASMParser.T__11);
						this.state = 201;
						this.match(QASMParser.INT);
						this.state = 202;
						this.match(QASMParser.T__12);
						this.state = 203;
						this.match(QASMParser.T__21);
					}
					this.state = 208;
					this._errHandler.sync(this);
					_alt = this._interp.adaptivePredict(this._input, 10, this._ctx);
				}

				this.state = 209;
				this.match(QASMParser.ID);
				break;

			case 2:
				this.enterOuterAlt(localctx, 2);
				this.state = 217;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 11, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						this.state = 210;
						this.match(QASMParser.ID);
						this.state = 211;
						this.match(QASMParser.T__11);
						this.state = 212;
						this.match(QASMParser.INT);
						this.state = 213;
						this.match(QASMParser.T__12);
						this.state = 214;
						this.match(QASMParser.T__21);
					}
					this.state = 219;
					this._errHandler.sync(this);
					_alt = this._interp.adaptivePredict(this._input, 11, this._ctx);
				}

				this.state = 220;
				this.match(QASMParser.ID);
				this.state = 221;
				this.match(QASMParser.T__11);
				this.state = 222;
				this.match(QASMParser.INT);
				this.state = 223;
				this.match(QASMParser.T__12);
				break;

			case 3:
				this.enterOuterAlt(localctx, 3);
				this.state = 235;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 13, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						this.state = 228;
						this._errHandler.sync(this);
						let _alt = this._interp.adaptivePredict(this._input, 12, this._ctx);
						while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
							if (_alt === 1) {
								this.state = 224;
								this.match(QASMParser.ID);
								this.state = 225;
								this.match(QASMParser.T__21);
							}
							this.state = 230;
							this._errHandler.sync(this);
							_alt = this._interp.adaptivePredict(this._input, 12, this._ctx);
						}

						this.state = 231;
						this.match(QASMParser.ID);
						this.state = 232;
						this.match(QASMParser.T__21);
					}
					this.state = 237;
					this._errHandler.sync(this);
					_alt = this._interp.adaptivePredict(this._input, 13, this._ctx);
				}

				this.state = 238;
				this.match(QASMParser.ID);
				this.state = 239;
				this.match(QASMParser.T__11);
				this.state = 240;
				this.match(QASMParser.INT);
				this.state = 241;
				this.match(QASMParser.T__12);
				break;
		}
	} catch (re) {
		if (re instanceof RecognitionException) {
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

class ArgumentContext extends ParserRuleContext {
	constructor(parser, parent, invokingState) {
		if (parent === undefined) {
			parent = null;
		}
		if (invokingState === undefined || invokingState === null) {
			invokingState = -1;
		}
		super(parent, invokingState);
		this.parser = parser;
		this.ruleIndex = QASMParser.RULE_argument;
		return this;
	}

	ID = function () {
		return this.getToken(QASMParser.ID, 0);
	};

	INT = function () {
		return this.getToken(QASMParser.INT, 0);
	};

	enterRule = function (listener) {
		if (listener instanceof QASMListener) {
			listener.enterArgument(this);
		}
	};

	exitRule = function (listener) {
		if (listener instanceof QASMListener) {
			listener.exitArgument(this);
		}
	};
}

QASMParser.ArgumentContext = ArgumentContext;

QASMParser.prototype.argument = function () {
	const localctx = new ArgumentContext(this, this._ctx, this.state);
	this.enterRule(localctx, 26, QASMParser.RULE_argument);
	try {
		this.state = 249;
		this._errHandler.sync(this);
		const la_ = this._interp.adaptivePredict(this._input, 15, this._ctx);
		switch (la_) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				this.state = 244;
				this.match(QASMParser.ID);
				break;

			case 2:
				this.enterOuterAlt(localctx, 2);
				this.state = 245;
				this.match(QASMParser.ID);
				this.state = 246;
				this.match(QASMParser.T__11);
				this.state = 247;
				this.match(QASMParser.INT);
				this.state = 248;
				this.match(QASMParser.T__12);
				break;
		}
	} catch (re) {
		if (re instanceof RecognitionException) {
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

class ExplistContext extends ParserRuleContext {
	constructor(parser, parent, invokingState) {
		if (parent === undefined) {
			parent = null;
		}
		if (invokingState === undefined || invokingState === null) {
			invokingState = -1;
		}
		super(parent, invokingState);
		this.parser = parser;
		this.ruleIndex = QASMParser.RULE_explist;
	}

	exp = function (i) {
		if (i === undefined) {
			i = null;
		}
		if (i === null) {
			return this.getTypedRuleContexts(ExpContext);
		} else {
			return this.getTypedRuleContext(ExpContext, i);
		}
	}.bind(this);

	enterRule = function (listener) {
		if (listener instanceof QASMListener) {
			listener.enterExplist(this);
		}
	}.bind(this);

	exitRule = function (listener) {
		if (listener instanceof QASMListener) {
			listener.exitExplist(this);
		}
	}.bind(this);
}

QASMParser.ExplistContext = ExplistContext;

QASMParser.prototype.explist = function () {
	const localctx = new ExplistContext(this, this._ctx, this.state);
	this.enterRule(localctx, 28, QASMParser.RULE_explist);
	try {
		this.enterOuterAlt(localctx, 1);
		this.state = 256;
		this._errHandler.sync(this);
		let _alt = this._interp.adaptivePredict(this._input, 16, this._ctx);
		while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
			if (_alt === 1) {
				this.state = 251;
				this.exp(0);
				this.state = 252;
				this.match(QASMParser.T__21);
			}
			this.state = 258;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 16, this._ctx);
		}

		this.state = 259;
		this.exp(0);
	} catch (re) {
		if (re instanceof RecognitionException) {
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

class ExpContext extends ParserRuleContext {
	constructor(parser, parent, invokingState) {
		if (parent === undefined) {
			parent = null;
		}
		if (invokingState === undefined || invokingState === null) {
			invokingState = -1;
		}
		super(parent, invokingState);
		this.parser = parser;
		this.ruleIndex = QASMParser.RULE_exp;
	}

	exp = function (i) {
		if (i === undefined) {
			i = null;
		}
		if (i === null) {
			return this.getTypedRuleContexts(ExpContext);
		} else {
			return this.getTypedRuleContext(ExpContext, i);
		}
	};

	unaryop = function () {
		return this.getTypedRuleContext(UnaryopContext, 0);
	};

	atom = function () {
		return this.getTypedRuleContext(AtomContext, 0);
	};

	enterRule = function (listener) {
		if (listener instanceof QASMListener) {
			listener.enterExp(this);
		}
	};

	exitRule = function (listener) {
		if (listener instanceof QASMListener) {
			listener.exitExp(this);
		}
	};
}

class AtomContext extends ParserRuleContext {
	constructor(parser, parent, invokingState) {
		if (parent === undefined) {
			parent = null;
		}
		if (invokingState === undefined || invokingState === null) {
			invokingState = -1;
		}
		super(parent, invokingState);
		this.parser = parser;
		this.ruleIndex = QASMParser.RULE_atom;
	}

	INT = function () {
		return this.getToken(QASMParser.INT, 0);
	};

	REAL = function () {
		return this.getToken(QASMParser.REAL, 0);
	};

	PI = function () {
		return this.getToken(QASMParser.PI, 0);
	};

	ID = function () {
		return this.getToken(QASMParser.ID, 0);
	};

	enterRule = function (listener) {
		if (listener instanceof QASMListener) {
			listener.enterAtom(this);
		}
	}.bind(this);

	exitRule = function (listener) {
		if (listener instanceof QASMListener) {
			listener.exitAtom(this);
		}
	}.bind(this);
}

QASMParser.AtomContext = AtomContext;

class UnaryopContext extends ParserRuleContext {
	constructor(parser, parent, invokingState) {
		if (parent === undefined) {
			parent = null;
		}
		if (invokingState === undefined || invokingState === null) {
			invokingState = -1;
		}
		super(parent, invokingState);
		this.parser = parser;
		this.ruleIndex = QASMParser.RULE_unaryop;
	}

	enterRule = function (listener) {
		if (listener instanceof QASMListener) {
			listener.enterUnaryop(this);
		}
	};

	exitRule = function (listener) {
		if (listener instanceof QASMListener) {
			listener.exitUnaryop(this);
		}
	};
}

QASMParser.UnaryopContext = UnaryopContext;
