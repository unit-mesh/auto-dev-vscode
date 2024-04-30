/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { Tensor as ONNXTensor } from "onnxruntime-common";

/**
 * Perform mean pooling of the last hidden state followed by a normalization step.
 * @param {Tensor} last_hidden_state Tensor of shape [batchSize, seqLength, embedDim]
 * @param {Tensor} attention_mask Tensor of shape [batchSize, seqLength]
 * @returns {Tensor} Returns a new Tensor of shape [batchSize, embedDim].
 */
export function mean_pooling(last_hidden_state: any, attention_mask: any) {

	// last_hidden_state: [batchSize, seqLength, embedDim]
	// attention_mask:    [batchSize, seqLength]

	let shape = [last_hidden_state.dims[0], last_hidden_state.dims[2]];
	// @ts-ignore
	let returnedData = new last_hidden_state.cpuData.constructor(shape[0] * shape[1]);
	let [batchSize, seqLength, embedDim] = last_hidden_state.dims;

	let outIndex = 0;
	for (let i = 0; i < batchSize; ++i) {
		let offset = i * embedDim * seqLength;

		for (let k = 0; k < embedDim; ++k) {
			let sum = 0;
			let count = 0;

			let attnMaskOffset = i * seqLength;
			let offset2 = offset + k;
			// Pool over all words in sequence
			for (let j = 0; j < seqLength; ++j) {
				// index into attention mask
				let attn = Number(attention_mask.cpuData[attnMaskOffset + j]);

				count += attn;
				sum += last_hidden_state.cpuData[offset2 + j * embedDim] * attn;
			}

			let avg = sum / count;
			returnedData[outIndex++] = avg;
		}
	}

	return new ONNXTensor(
		last_hidden_state.type,
		returnedData,
		shape
	);
}

/**
 * Reshapes a 1-dimensional array into an n-dimensional array, according to the provided dimensions.
 *
 * @example
 *   reshape([10                    ], [1      ]); // Type: number[]      Value: [10]
 *   reshape([1, 2, 3, 4            ], [2, 2   ]); // Type: number[][]    Value: [[1, 2], [3, 4]]
 *   reshape([1, 2, 3, 4, 5, 6, 7, 8], [2, 2, 2]); // Type: number[][][]  Value: [[[1, 2], [3, 4]], [[5, 6], [7, 8]]]
 *   reshape([1, 2, 3, 4, 5, 6, 7, 8], [4, 2   ]); // Type: number[][]    Value: [[1, 2], [3, 4], [5, 6], [7, 8]]
 * @param {T[]|DataArray} data The input array to reshape.
 * @param {DIM} dimensions The target shape/dimensions.
 * @template T
 * @template {[number]|number[]} DIM
 * @returns {NestArray<T, DIM["length"]>} The reshaped array.
 */
export function reshape(data: any, dimensions: any[]) {
	const totalElements = data.length;
	const dimensionSize = dimensions.reduce((a, b) => a * b);

	if (totalElements !== dimensionSize) {
		throw Error(`cannot reshape array of size ${totalElements} into shape (${dimensions})`);
	}

	/** @type {any} */
	let reshapedArray = data;

	for (let i = dimensions.length - 1; i >= 0; i--) {
		reshapedArray = reshapedArray.reduce((acc: any[], val: any) => {
			let lastArray = acc[acc.length - 1];

			if (lastArray.length < dimensions[i]) {
				lastArray.push(val);
			} else {
				acc.push([val]);
			}

			return acc;
		}, [[]]);
	}

	return reshapedArray[0];
}
