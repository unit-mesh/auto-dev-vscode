import { l10n } from "vscode";
import { FieldInfoBase } from "./FieldInfoBase";
import { MethodInfoBase } from "./MethodInfoBase";

export class  ClassInfoBase{
	name: string;
	fatherName?: string;
	doc?: string;
	fields?: FieldInfoBase[];
	unfinishedMethods?: MethodInfoBase[];
	completedMethods?: MethodInfoBase[];
	constructor(
		className: string,
		fatherName?: string,
		doc?: string,
		fields?: FieldInfoBase[],
		methods?: MethodInfoBase[],
	) {
		this.name = className;
		this.fatherName = fatherName;
		this.fields = fields;
		this.doc = doc;
		this.unfinishedMethods = [];
		this.completedMethods = [];
		if (methods) {
			for (let item of methods) {
				if (item.methodDoc.includes(l10n.t('Not Completed'))) {
					this.unfinishedMethods.push(item);
				} else {
					this.completedMethods.push(item);
				}
			}
		}
	}
}
