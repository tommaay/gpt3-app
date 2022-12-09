import { useEffect, useState } from "react";
import { json, ActionFunction } from "@remix-run/node";
import { Form, useActionData, useTransition } from "@remix-run/react";
import { Configuration, OpenAIApi } from "openai";

export const action: ActionFunction = async ({ request }) => {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);
  const formData = await request.formData();
  const prompt = formData.get("prompt");

  const basePromptPrefix = "Rewrite this resume job description to be more professional: ";

  const baseCompletion = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: `${basePromptPrefix}${prompt}`,
    temperature: 0.7,
    max_tokens: 100,
  });

  const basePromptOutput = baseCompletion.data.choices.pop();

  return json({ output: basePromptOutput });
};

export default function Index() {
  const [output, setOutput] = useState();

  const actionData = useActionData();
  const transition = useTransition();

  useEffect(() => {
    if (actionData?.output?.text) {
      setOutput(actionData.output.text);
    }
  }, [actionData?.output?.text]);

  function resetOutput() {
    setOutput(undefined);
  }

  return (
    <main className="max-w-lg mx-auto pt-10">
      <h1 className="text-h1 font-bold text-center text-orange-200">Supercharge Your Resume!</h1>
      <h2 className="text-h5 text-center mt-5 text-orange-100">
        Enhance your job description with AI assisted writing.
      </h2>

      <Form method="post" className="mt-10 flex flex-col mx-auto">
        <label htmlFor="prompt" className="mb-1 text-h5">
          Enter your job description:
        </label>
        <textarea name="prompt" className="mx-auto w-full h-32 rounded-md text-black p-3 text-sm" />
        <button
          type="submit"
          className="mt-4 ml-auto bg-orange-300 py-1 w-[8rem] rounded-full hover:bg-orange-600 transition-all duration-200"
          disabled={!!transition?.submission}
        >
          {!!transition?.submission ? "Generating..." : "Generate"}
        </button>
      </Form>

      {output && (
        <>
          <h2 className="mt-10 mb-2 text-h5">Output:</h2>
          <div className="p-3 bg-green-100 text-black rounded-md">
            <p>{output}</p>
          </div>
        </>
      )}
    </main>
  );
}
