import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ideRequest } from '../util/ide';
import { useWebviewListener } from '../hooks/useWebviewListener';

interface CodeSample {
	id: string; // 添加 id 成员
	filePath: string;
	codeContext: string;
	code: string;
	doc: string;
}

interface CodeContext {
	id: string; // 添加 id 成员
	filePath: string;
	codeContext: string;
	code: string;
	doc: string;
}

interface Group {
	name: string;
	itemMap: Map<string, string[]>; // 修改 items 为 itemMap
}

const Container = styled.div`
	font-family: Arial, sans-serif;
	margin: 20px;
	background-color: #000; /* 黑色背景 */
	color: #fff; /* 白色文本 */
`;

const Tabs = styled.div`
	display: flex;
	margin-bottom: 20px;
`;

const Tab = styled.div<{ active: boolean }>`
	padding: 10px 20px;
	cursor: pointer;
	border: 1px solid #ddd;
	background-color: ${({ active }) => (active ? '#555' : '#333')}; /* 深灰色背景 */
	color: #fff; /* 白色文本 */
	margin-right: 10px;
`;

const TabContent = styled.div<{ active: boolean }>`
	display: ${({ active }) => (active ? 'block' : 'none')};
	padding: 20px;
	border: 1px solid #555;
	background-color: #222; /* 深灰色背景 */
	color: #fff; /* 白色文本 */
`;

const FormContainer = styled.div`
	margin-top: 20px;
	padding: 20px;
	border: 1px solid #555;
	background-color: #333; /* 深灰色背景 */
	color: #fff; /* 白色文本 */
`;

const Input = styled.input`
	width: 100%;
	padding: 10px;
	margin-bottom: 10px;
	box-sizing: border-box;
	background-color: #444; /* 浅灰色背景 */
	color: #fff; /* 白色文本 */
	border: 1px solid #555;
`;

const TextArea = styled.textarea`
	width: 100%;
	padding: 10px;
	margin-bottom: 10px;
	box-sizing: border-box;
	background-color: #444; /* 浅灰色背景 */
	color: #fff; /* 白色文本 */
	border: 1px solid #555;
`;

const Button = styled.button`
	padding: 10px 20px;
	cursor: pointer;
	background-color: #555; /* 浅灰色背景 */
	color: #fff; /* 白色文本 */
	border: 1px solid #777;
`;

const CodeContent = styled.div`
	white-space: pre; /* 保留文本格式 */
	font-family: monospace; /* 使用等宽字体 */
	max-height: 200px; /* 设置最大高度 */
	overflow-y: auto; /* 添加纵向滚动条 */
	border: 1px solid #555;
	padding: 10px;
	box-sizing: border-box;
	background-color: #444; /* 浅灰色背景 */
	color: #fff; /* 白色文本 */
`;

const CodeSample = styled.div`
	margin-top: 20px;
	padding: 20px;
	border: 1px solid #555;
	background-color: #333; /* 深灰色背景 */
	color: #fff; /* 白色文本 */
`;

const Actions = styled.div`
	margin-top: 10px;
	display: flex;
	gap: 10px;
`;

const Checkbox = styled.input.attrs({ type: 'checkbox' })`
	margin-right: 10px;
`;

const GroupNameModal = styled.div`
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: rgba(0, 0, 0, 0.5);
	display: flex;
	justify-content: center;
	align-items: center;
`;

const GroupNameContent = styled.div`
	background-color: #333;
	padding: 20px;
	border-radius: 5px;
	width: 300px;
`;

const GroupItem = styled.div`
	margin-top: 20px;
	padding: 20px;
	border: 1px solid #555;
	background-color: #333; /* 深灰色背景 */
	color: #fff; /* 白色文本 */
`;

const CodeContextPanel: React.FC = () => {
	const [activeTab, setActiveTab] = useState<'CodeSample' | 'FrameworkCodeFragment' | 'Groups'>('CodeSample');
	const [codeSamples, setCodeSamples] = useState<CodeSample[]>([]);
	const [codeContexts, setCodeContexts] = useState<CodeContext[]>([]);
	const [groups, setGroups] = useState<Group[]>([]);
	const [formData, setFormData] = useState<CodeSample | CodeContext>({
		id: '', // 初始化 id
		filePath: '',
		code: '',
		doc: '',
		codeContext: '',
	});
	const [formTitle, setFormTitle] = useState('添加代码样例');
	const [editIndex, setEditIndex] = useState<number | null>(null);
	const [originalItem, setOriginalItem] = useState<CodeSample | CodeContext | null>(null);
	const [selectedItems, setSelectedItems] = useState<Map<string, string[]>>(new Map()); // 使用 Map 存储选中的项
	const [showGroupNameModal, setShowGroupNameModal] = useState(false);
	const [groupName, setGroupName] = useState('');
	const [isDataLoaded, setIsDataLoaded] = useState(false); // 新增状态，用于检查数据是否已加载

	// 从IDE获取数据
	useEffect(() => {
		ideRequest("WorkspaceService.GetDataStorage", "CodeSample");
		ideRequest("WorkspaceService.GetDataStorage", "FrameworkCodeFragment");
		ideRequest("WorkspaceService.Groups.GetGroups",""); // 发送请求获取 Groups 信息
	}, []);

	// 监听从IDE发送的数据
	useWebviewListener("WorkspaceService_GetDataStorage", async (data) => {
		switch (data.key) {
			case "CodeSample":
				if (data.storages) {
					let temp = JSON.parse(data.storages) as CodeSample[];
					setCodeSamples(temp);
				}
				break;
			case "FrameworkCodeFragment":
				if (data.storages) {
					let temp2 = JSON.parse(data.storages) as CodeContext[];
					setCodeContexts(temp2);
				}
				break;
			default:
				break;
		}
		setIsDataLoaded(true); // 数据加载完成后设置为 true
	});

	// 监听从IDE发送的 Groups 信息
	useWebviewListener("WorkspaceService_Groups_GetGroups", async (data) => {
		if (data.groups) {
			const parsedGroups = jsonToGroups(data.groups);
			console.log(parsedGroups);

			setGroups(parsedGroups);
		}
	});

	// 监听从IDE发送的数据
	useWebviewListener("WorkspaceService_AddDataStorage", async (data) => {
		refreshItems();
	});

	const refreshItems = () => {
		ideRequest("WorkspaceService.GetDataStorage", "CodeSample");
		ideRequest("WorkspaceService.GetDataStorage", "FrameworkCodeFragment");
	};

	const handleTabChange = (tabName: 'CodeSample' | 'FrameworkCodeFragment' | 'Groups') => {
		// 保存当前标签的选中项
		const currentSelectedItems = selectedItems.get(activeTab) || [];
		setSelectedItems(new Map(selectedItems.set(activeTab, currentSelectedItems)));

		setActiveTab(tabName);
		setFormTitle(tabName === 'CodeSample' ? '添加代码样例' : tabName === 'FrameworkCodeFragment' ? '添加代码上下文' : '管理编组');
		clearForm();

		// 如果数据未加载，则在切换到编组管理时请求数据
		if (tabName === 'Groups' && !isDataLoaded) {
			refreshItems();
		}
	};

	const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = event.target;
		setFormData({ ...formData, [name]: value });
	};

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();

		if (editIndex === null) {
			// 添加新样例或上下文
			const newItem = {
				id: Date.now().toString(), // 使用时间戳作为唯一 id
				filePath: formData.filePath,
				code: formData.code,
				doc: formData.doc,
				codeContext: formData.codeContext,
			};

			if (activeTab === 'CodeSample') {
				setCodeSamples([...codeSamples, newItem as CodeSample]);
			} else {
				setCodeContexts([...codeContexts, newItem as CodeContext]);
			}
			let dataformat = {
				key: activeTab,
				originalItem: JSON.stringify(newItem),
			}
			ideRequest("WorkspaceService.AddDataStorage", dataformat);
		} else {
			// 更新现有样例或上下文的说明
			const items = activeTab === 'CodeSample' ? codeSamples : codeContexts;
			items[editIndex] = {
				id: formData.id,
				filePath: formData.filePath,
				code: formData.code,
				doc: formData.doc,
				codeContext: formData.codeContext,
			};

			if (activeTab === 'CodeSample') {
				setCodeSamples([...items]);
			} else {
				setCodeContexts([...items]);
			}

			let originalItemJson = JSON.stringify(originalItem);
			let formDataJson = JSON.stringify(formData);
			let dataformat = {
				key: activeTab,
				originalItem: originalItemJson,
				newItem: formDataJson
			}
			ideRequest("WorkspaceService.ChangeDataStorage", dataformat);
		}

		clearForm();
	};

	const editItem = (index: number) => {
		const items = activeTab === 'CodeSample' ? codeSamples : codeContexts;
		const item = items[index];
		setFormData({
			id: item.id,
			filePath: item.filePath,
			code: item.code,
			doc: item.doc,
			codeContext: formData.codeContext,
		});
		setOriginalItem({ ...item }); // 保存编辑前的数据
		setEditIndex(index);
		setFormTitle(activeTab === 'CodeSample' ? '编辑样例说明' : '编辑上下文说明');
	};

	const deleteItem = (index: number) => {
		if (activeTab === 'CodeSample') {
			let dataformat = {
				key: activeTab,
				originalItem: JSON.stringify(codeSamples[index]),
			}
			ideRequest("WorkspaceService.RemoveDataStorage", dataformat);
			setCodeSamples(codeSamples.filter((_, i) => i !== index));
		} else {
			let dataformat = {
				key: activeTab,
				originalItem: JSON.stringify(codeContexts[index]),
			}
			ideRequest("WorkspaceService.RemoveDataStorage", dataformat);
			setCodeContexts(codeContexts.filter((_, i) => i !== index));
		}
	};

	const clearForm = () => {
		setFormData({
			id: '',
			filePath: '',
			code: '',
			doc: '',
			codeContext: '',
		});
		setOriginalItem(null); // 清空编辑前的数据
		setEditIndex(null);
		setFormTitle(activeTab === 'CodeSample' ? '添加代码样例' : '添加代码上下文');
	};

	const handleCheckboxChange = (id: string) => {
		const type = activeTab === 'CodeSample' ? 'CodeSample' : 'FrameworkCodeFragment';
		const currentSelectedItems = selectedItems.get(type) || [];

		if (currentSelectedItems.includes(id)) {
			setSelectedItems(new Map(selectedItems.set(type, currentSelectedItems.filter(i => i !== id))));
		} else {
			setSelectedItems(new Map(selectedItems.set(type, [...currentSelectedItems, id])));
		}
	};

	const handleGroupItems = () => {
		setShowGroupNameModal(true);
	};

	const handleGroupNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setGroupName(event.target.value);
	};

	const handleGroupNameSubmit = () => {
		const newItemMap = new Map(selectedItems);
		const newGroup: Group = {
			// 使用时间戳作为唯一 id
			name: groupName,
			itemMap: newItemMap,
		};
		setGroups([...groups, newGroup]);

		// 发送编组后的数据到 IDE

		ideRequest("WorkspaceService.Groups.AddGroup", {data:JSON.stringify(newGroup)});

		setShowGroupNameModal(false);
		setSelectedItems(new Map());
		setGroupName('');
	};

	const deleteGroup = (index: number) => {
		const groupToDelete = groups[index];
		setGroups(groups.filter((_, i) => i !== index));
		ideRequest("WorkspaceService.Groups.RemoveGroup", {group:JSON.stringify(groupToDelete)});
	};

	const getItemById = (id: string) => {
		for(let item of codeSamples){
		console.log(item.id);
		}
		const sample = codeSamples.find(sample => sample.id == id);
		if (sample) {
			return { type: 'CodeSample', item: sample };}
		const context = codeContexts.find(context => context.id == id);
		if (context){
			 return { type: 'CodeContext', item: context };}
		return null;
	};

	return (
		<Container>
			<h1>代码样例管理</h1>

			<Tabs>
				<Tab active={activeTab === 'CodeSample'} onClick={() => handleTabChange('CodeSample')}>
					代码样例
				</Tab>
				<Tab active={activeTab === 'FrameworkCodeFragment'} onClick={() => handleTabChange('FrameworkCodeFragment')}>
					代码上下文
				</Tab>
				<Tab active={activeTab === 'Groups'} onClick={() => handleTabChange('Groups')}>
					编组管理
				</Tab>
			</Tabs>

			<TabContent active={activeTab === 'CodeSample'}>
				<FormContainer>
					<h2>{formTitle}</h2>
					<form onSubmit={handleSubmit}>
						<Input
							type="text"
							name="filePath"
							placeholder="文件路径"
							value={formData.filePath}
							onChange={handleInputChange}
							required
							readOnly={editIndex !== null}
						/>
						<TextArea
							name="code"
							placeholder="代码内容"
							rows={5}
							value={formData.code}
							onChange={handleInputChange}
							required
							readOnly={editIndex !== null}
						/>
						<TextArea
							name="doc"
							placeholder="样例说明"
							rows={5}
							value={formData.doc}
							onChange={handleInputChange}
							required
						/>
						<Button type="submit">保存</Button>
						<Button type="button" onClick={clearForm}>取消</Button>
					</form>
				</FormContainer>

				<div>
					{codeSamples.map((sample, index) => (
						<CodeSample key={sample.id}>
							<Checkbox
								checked={(selectedItems.get('CodeSample') || []).includes(sample.id)}
								onChange={() => handleCheckboxChange(sample.id)}
							/>
							<h3>文件路径: {sample.filePath}</h3>
							<CodeContent>{sample.code}</CodeContent>
							<p>样例说明: {sample.doc}</p>
							<Actions>
								<Button onClick={() => editItem(index)}>编辑</Button>
								<Button onClick={() => deleteItem(index)}>删除</Button>
							</Actions>
						</CodeSample>
					))}
				</div>
			</TabContent>

			<TabContent active={activeTab === 'FrameworkCodeFragment'}>
				<FormContainer>
					<h2>{formTitle}</h2>
					<form onSubmit={handleSubmit}>
						<Input
							type="text"
							name="filePath"
							placeholder="文件路径"
							value={formData.filePath}
							onChange={handleInputChange}
							required
							readOnly={editIndex !== null}
						/>
						<TextArea
							name="code"
							placeholder="代码上下文内容"
							value={formData.code}
							rows={5}
							onChange={handleInputChange}
							required
							readOnly={editIndex !== null}
						/>
						<TextArea
							name="doc"
							placeholder="上下文说明"
							value={formData.doc}
							rows={5}
							onChange={handleInputChange}
							required
						/>
						<Button type="submit">保存</Button>
						<Button type="button" onClick={clearForm}>取消</Button>
					</form>
				</FormContainer>

				<div>
					{codeContexts.map((context, index) => (
						<CodeSample key={context.id}>
							<Checkbox
								checked={(selectedItems.get('FrameworkCodeFragment') || []).includes(context.id)}
								onChange={() => handleCheckboxChange(context.id)}
							/>
							<h3>文件路径: {context.filePath}</h3>
							<CodeContent>{context.code}</CodeContent>
							<p>上下文说明: {context.doc}</p>
							<Actions>
								<Button onClick={() => editItem(index)}>编辑</Button>
								<Button onClick={() => deleteItem(index)}>删除</Button>
							</Actions>
						</CodeSample>
					))}
				</div>
			</TabContent>

			<TabContent active={activeTab === 'Groups'}>
				<FormContainer>
					<h2>{formTitle}</h2>
					<div>
						{groups.map((group, index) => (
							<GroupItem key={index}>
								<h3>编组名称: {group.name}</h3>
								<div>
									{Array.from(group.itemMap.entries()).map(([type, ids]) => (
										<div key={type}>
											<h4>{type === 'CodeSample' ? '代码样例' : '代码上下文'}</h4>
											<ul>
												{ids.map((id, itemIndex) => {
													const itemInfo = getItemById(id);
													if (!itemInfo) return null;
													const { item } = itemInfo;
													return (
														<li key={itemIndex}>
															<h5>文件路径: {item.filePath}</h5>
															<CodeContent>{item.code}</CodeContent>
															<p>说明: {item.doc}</p>
														</li>
													);
												})}
											</ul>
										</div>
									))}
								</div>
								<Actions>
									<Button onClick={() => deleteGroup(index)}>删除编组</Button>
								</Actions>
							</GroupItem>
						))}
					</div>
				</FormContainer>
			</TabContent>

			<Button onClick={handleGroupItems} disabled={Array.from(selectedItems.values()).flat().length === 0}>
				编组选中的项
			</Button>

			{showGroupNameModal && (
				<GroupNameModal>
					<GroupNameContent>
						<h2>输入编组名称</h2>
						<Input
							type="text"
							value={groupName}
							onChange={handleGroupNameChange}
							placeholder="编组名称"
							required
						/>
						<Actions>
							<Button onClick={handleGroupNameSubmit}>确定</Button>
							<Button onClick={() => setShowGroupNameModal(false)}>取消</Button>
						</Actions>
					</GroupNameContent>
				</GroupNameModal>
			)}
		</Container>
	);
};

export default CodeContextPanel;

function jsonToGroups(jsonString: string): Group[] {
	// 解析 JSON 字符串为 JavaScript 对象
	const jsonObject = JSON.parse(jsonString);

	// 将 JavaScript 对象转换为 Group 数组
	const groups: Group[] = Object.keys(jsonObject).map(groupName => {
			const groupData = jsonObject[groupName];
			const itemMap = new Map<string, string[]>();

			Object.keys(groupData).forEach(key => {
					// 将数值数组转换为字符串数组
					itemMap.set(key, groupData[key].map(String));
			});

			return {
					name: groupName,
					itemMap: itemMap
			};
	});

	return groups;
}
