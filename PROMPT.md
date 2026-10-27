# Build a Production-Grade AI Background Removal Engine

## Primary Objective

I want to transform the existing background-removal application into a production-grade AI background-removal engine.

My ONLY primary objective is:

**Produce the highest possible background-removal quality across different types of images, while targeting 3–5 seconds of processing time for typical images.**

Quality is more important than retaining the existing implementation.

You are free to replace models, algorithms, inference architecture, preprocessing, postprocessing, backend technology and the existing workflow.

Do not preserve an algorithm simply because it is already implemented.

## 1. First: Audit the Entire Existing Codebase

Before changing anything, inspect the complete existing implementation.

Pay particular attention to:

- IS-Net / DIS
- BiRefNet
- MODNet
- IS-Net + Guided Filter
- BiRefNet + MODNet hybrid fusion
- ONNX model configurations and weights
- Image preprocessing and normalization
- Alpha-mask generation
- Image resizing and reconstruction
- API endpoints
- Inference execution and hardware acceleration
- Existing frontend processing workflow

Important observations from actual testing:

1. IS-Net works reasonably well on many images but does not correctly remove backgrounds from every image.
2. BiRefNet currently produces very poor results in my implementation. It sometimes leaves a thick border around the subject instead of accurately removing the background.
3. Do not assume BiRefNet is a good model just because it performs well in published research.
4. MODNet and other models must also be evaluated against actual results.

Investigate whether BiRefNet's problem comes from the model itself, preprocessing, ONNX export, output interpretation, resizing, thresholding or postprocessing.

Inspect raw model outputs before drawing conclusions.

Do not modify the existing code until you understand the current implementation.

## 2. Establish a Model Benchmarking Framework

I want an objective comparison of candidate models.

Evaluate suitable candidates, including:

- IS-Net / DIS
- BiRefNet and suitable variants
- RMBG 2.0, subject to commercial licensing
- MODNet
- ViTMatte
- Other promising general-purpose segmentation and image-matting models you identify through research.

Do not assume every candidate must become part of production.

Evaluate them across:

1. Human portraits.
2. Human hair and fine strands.
3. Products and e-commerce photographs.
4. Cars and vehicles.
5. Animals and fur.
6. Transparent objects and glass.
7. Complex backgrounds.
8. Objects with holes or internal gaps.
9. Multiple overlapping subjects.
10. Difficult foreground/background color combinations.

Create a repeatable benchmark that uses exactly the same original images for every model.

Measure:

- Foreground/background separation.
- Subject completeness.
- Background leakage.
- Hair and fur preservation.
- Internal holes.
- Edge accuracy.
- Jagged boundaries.
- Color halos.
- Alpha matte quality.
- Processing time.
- Peak memory usage.

Use appropriate ground-truth datasets and alpha-matting metrics where available.

Include visual comparisons against white, black, grey and colored backgrounds.

Never select a model solely on its research-paper ranking.

## 3. Build an Adaptive Production Pipeline

The production engine must not run every available model sequentially for every upload.

I want an intelligent but lightweight processing architecture.

### Stage A: Image ingestion

- Validate image formats and dimensions.
- Correct EXIF orientation.
- Preserve original RGB information.
- Extract image metadata.
- Handle large images safely.
- Avoid unnecessary resizing or repeated image encoding.

### Stage B: Model selection

Select the best-performing model using actual benchmark results.

Initially, identify the strongest general-purpose candidate.

If different models demonstrate substantial advantages for particular image categories, introduce lightweight category-based routing.

Do not introduce a classifier unless it demonstrably improves results.

### Stage C: Primary segmentation

- Run one primary segmentation model.
- Use GPU acceleration where available.
- Use optimized inference.
- Produce a continuous alpha estimate whenever supported.
- Avoid unnecessarily aggressive thresholding.
- Preserve fine subject details.

### Stage D: Alpha-mask refinement

Investigate and implement appropriate techniques:

- Edge-aware refinement.
- Adaptive thresholding.
- Morphological operations where justified.
- Connected-component analysis.
- Internal-hole preservation.
- Guided filtering where beneficial.

Do not blindly apply erosion, dilation, Gaussian blur or other operations that can destroy hair, fur or fine edges.

### Stage E: Conditional image matting

Investigate trimap-guided matting with ViTMatte and portrait matting with MODNet.

Only invoke additional matting when the primary prediction has difficult or uncertain boundary regions.

Use the original image and suitable trimap information.

Avoid running additional neural networks on every upload unnecessarily.

### Stage F: Foreground reconstruction

Implement a proper foreground reconstruction and color-decontamination stage.

Investigate:

- Background color spill.
- Edge color contamination.
- Halo suppression.
- Alpha-aware foreground color estimation.
- Numerical stability around very low alpha values.

Do not simply apply an alpha mask to the original RGB image and assume all edge contamination has been removed.

### Stage G: High-resolution reconstruction

The final output must preserve the original image dimensions.

If the model operates on a smaller image:

- Reconstruct the mask at the original dimensions.
- Preserve original RGB pixels.
- Refine difficult boundaries using overlapping high-resolution crops when necessary.
- Maintain global consistency.
- Avoid seams between patches.
- Avoid losing small foreground details.

Do not force every image through expensive patch processing.

### Stage H: Quality assurance

Build lightweight quality checks for:

- Missing subject regions.
- Background leakage.
- Internal holes.
- Jagged boundaries.
- Excessive transparency.
- Thick foreground borders.
- Edge halos.

Only trigger recovery processing when the result warrants it.

Do not use arbitrary confidence thresholds without validating them against benchmark images.

## 4. Performance Architecture

I want a browser-based web application with server-side GPU inference as the primary production processing path.

Recommended architecture:

Frontend:
- Next.js / existing frontend architecture.
- Image upload and preview.
- Background replacement.
- Erase and restore editing.
- Transparent PNG export.

Backend:
- Dedicated image-processing API.
- Python-based inference service if it provides a meaningful advantage over the existing Node.js implementation.
- ONNX Runtime or another appropriate optimized inference engine.
- GPU acceleration.
- Efficient image decoding and reconstruction.
- Proper concurrency and memory management.

Use Sharp/libvips where appropriate for image preprocessing.

Evaluate TensorRT or other hardware-specific optimizations if the deployment hardware supports them.

Do not migrate technologies without measuring a performance or quality benefit.

## 5. Processing-Time Objective

Target 3–5 seconds for typical images under defined hardware and network conditions.

Optimize:

- Image upload.
- Model initialization.
- GPU inference.
- Preprocessing.
- Postprocessing.
- Image encoding.
- Response transfer.

Keep the inference service warm where possible.

Avoid cold model initialization on individual requests.

Do not execute multiple models sequentially in the normal processing path.

Use a primary fast path and an optional conditional quality-recovery path.

Measure actual end-to-end latency, not simulated progress.

Report separate timings for:

- Upload.
- Preprocessing.
- Model inference.
- Matting.
- Refinement.
- Reconstruction.
- Total response time.

Define performance targets for both preview and full-resolution exports.

Do not sacrifice image quality through excessive downscaling simply to achieve a faster benchmark.

## 6. Commercial and Licensing Requirements

Before integrating any model:

- Verify model-weight licensing.
- Verify code licensing.
- Check commercial-use permissions.
- Check model redistribution restrictions.
- Identify any required attribution.
- Identify hardware and deployment restrictions.

Do not assume publicly downloadable weights are commercially usable.

## 7. Frontend Requirements

Retain the existing image editor and improve it where necessary.

Users should receive:

- Original image preview.
- Transparent background preview.
- Before/after comparison.
- Background color replacement.
- Custom background selection.
- Erase and restore brushes.
- Original-resolution PNG export.

Keep the five-model comparison interface available in a separate developer/benchmark mode, not as the default user experience.

Users should not need to understand which AI model is being used.

The engine must make processing decisions automatically.

## 8. Engineering Rules

- Follow the existing repository's architecture where sensible.
- Do not introduce unnecessary dependencies.
- Do not generate fake progress percentages.
- Do not claim an optimization works without benchmarking it.
- Do not silently degrade image quality.
- Do not discard original image data.
- Add tests for preprocessing, alpha generation and reconstruction.
- Handle inference failures and GPU memory errors gracefully.
- Keep model configurations separate from pipeline orchestration.
- Keep processing logs and model-specific metrics.
- Ensure the frontend does not break during backend refactoring.

## 9. Implementation Strategy

Work in these phases:

Phase 1: Repository audit and model benchmark.

Phase 2: Select the strongest primary model based on actual results.

Phase 3: Implement the new segmentation and alpha-refinement engine.

Phase 4: Integrate conditional matting and foreground reconstruction.

Phase 5: Implement original-resolution processing.

Phase 6: Optimize GPU inference and measure end-to-end latency.

Phase 7: Integrate the new engine into the existing frontend.

Phase 8: Run regression testing against the benchmark dataset.

After every phase, provide:
- Files changed.
- Technical decisions.
- Models and algorithms selected.
- Benchmark results.
- Processing-time results.
- Known limitations.

## Final Instruction

Do not start by adding more models to the existing comparison grid.

First understand why the current models fail.

Then establish which model actually produces the best results on my test images.

Build the production engine around the strongest measured approach.

I am not interested in having the largest collection of models.

I want an engine that removes backgrounds accurately across portraits, products, vehicles, animals and difficult images, preserves fine details, produces clean edges without halos or thick borders, and returns high-quality transparent images at their original resolution.

**Quality of the final cutout is the ultimate success criterion.**