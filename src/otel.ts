import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-proto";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { ALLOW_ALL_BAGGAGE_KEYS, BaggageSpanProcessor } from "@opentelemetry/baggage-span-processor";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-node";
import { OTEL_EXPORTER_OTLP_ENDPOINT, OTEL_LOG_ENABLED } from "./config/config";

const otlpEndpoint = OTEL_EXPORTER_OTLP_ENDPOINT;
const otelLogEnabled = OTEL_LOG_ENABLED === "true";

const traceExporter = new OTLPTraceExporter({
    url: `${otlpEndpoint}/v1/traces`,
    headers: {}
});
const sdk = new NodeSDK({
    spanProcessors: [
        new BaggageSpanProcessor(ALLOW_ALL_BAGGAGE_KEYS),
        new BatchSpanProcessor(traceExporter)
    ],

    metricReader: new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter({
            url: `${otlpEndpoint}/v1/metrics`,
            headers: {}
        })
    }),
    instrumentations: [getNodeAutoInstrumentations()]
});

if (otelLogEnabled) {
    console.log("Staring OpenTelemetry SDK...");
    sdk.start();
}
