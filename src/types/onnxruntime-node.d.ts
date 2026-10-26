declare module "onnxruntime-node" {
  export interface InferenceSession {
    inputNames: string[];
    outputNames: string[];
    run(
      feeds: Record<string, Tensor>,
      options?: Record<string, unknown>
    ): Promise<Record<string, Tensor>>;
  }

  export class Tensor {
    constructor(
      type: "float32" | "int32" | "uint8" | string,
      data: Float32Array | Int32Array | Uint8Array | number[],
      dims?: number[]
    );
    dims: number[];
    type: string;
    data: Float32Array | Int32Array | Uint8Array;
  }

  export const InferenceSession: {
    create(path: string, options?: Record<string, unknown>): Promise<InferenceSession>;
  };

  const ort: {
    InferenceSession: typeof InferenceSession;
    Tensor: typeof Tensor;
  };

  export default ort;
}
