import OutputPrediction from "@/components/ui_elements/output_prediction/OutputPrediction";

export default function OutputPredictionDemo() {
  return (
    <div className="p-6">
      <OutputPrediction
        title="Output Prediction Test"
        prompt="Was gibt dieser Code aus?"
        code={`a = 2\nb = 3\nprint(a + b)`}
        language="python"
        expectedAnswers={["5", "5.0"]}
        onSubmit={(ans, ok) => console.log("Submitted:", ans, ok)}
        onCorrect={() => console.log("✅ Correct")}
        onWrong={() => console.log("❌ Wrong")}
      />
    </div>
  );
}
