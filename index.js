require('dotenv').config();
const { OpenAI } = require('langchain/llms/openai');
const { PromptTemplate } = require('langchain/prompts');
const { StructuredOutputParser } = require('langchain/output_parsers');
const inquirer = require('inquirer');

const model = new OpenAI({
	openAIApiKey: process.env.OPENAI_API_KEY,
	temperature: 0,
	model: 'gpt-3.5-turbo'
});

const parser = StructuredOutputParser.fromNamesAndDescriptions({
	issueOfCause: 'The understanding of how and why the issue described by the user is happening.',
	remedyForSituation: 'A multi step process on how to address, fix and monitor the repair of the lawn.'
});

const promptFunc = async (userInput) => {
	try {
		const formatInstructions = parser.getFormatInstructions();

		const prompt = new PromptTemplate({
			template: 'You are an expert gardener/horticulturalist with many years of experience. You use science to understand and diagnose issues regarding to lawn care. Answer the users issue as thoroughly as possible while using terms understandable by the lay person. \n{format_instructions}\n{question}',
			inputVariables: ['question'],
			partialVariables: { format_instructions: formatInstructions }
		});

		const promptInput = await prompt.format({
			question: userInput
		});

		const response = await model.call(promptInput);

		console.log(await parser.parse(response));
	} catch (error) {
		console.error(error);
	}
};

(() => {
	inquirer
		.prompt([
			{
				type: 'input',
				name: 'name',
				message: 'Describe the issue you are having with your lawn:'
			}
		])
		.then(response => {
			promptFunc(response.name);
		});
})();

