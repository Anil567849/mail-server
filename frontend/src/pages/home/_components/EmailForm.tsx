import { useMutation } from "@tanstack/react-query";
import React, { ChangeEventHandler, useState } from "react";

interface IFormData {
    fromEmail: string;
    toEmail: string;
    subject: string;
    body: string;
  }

const EmailForm = () => {

    const [formData, setFormData] = useState<IFormData>({
        fromEmail: "from@gmail.com",
        toEmail: "to@gmail.com",
        subject: "This is a subject",
        body: "This is a body",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void =>{
        const { name, value } = e.target;
        setFormData({
        ...formData,
        [name]: value,
        });
    };

    const mutation = useMutation({
        mutationFn: (data: IFormData) => {
            return fetch('http://localhost:8000/api/send-mail', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: formData.fromEmail,
                to: formData.toEmail,
                subject: formData.subject,
                body: formData.body,
            }),
            });
        },

        onError: (error, variables, context) => {
            console.log('error bhai', error.message)
        },

        onSuccess: (data, variables, context) => {
            if(data.status != 500){
                alert("mail sent")
            }else{
                alert("mail not sent")
            }
        },
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        mutation.mutate(formData);
    };

    return (
        <form
        onSubmit={handleSubmit}
        className="max-w-lg mx-auto p-6 bg-white shadow-md rounded-md"
        >
        <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="fromEmail">
            From Email
            </label>
            <input
            type="email"
            name="fromEmail"
            id="fromEmail"
            value={formData.fromEmail}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
        </div>

        <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="toEmail">
            To Email
            </label>
            <input
            type="email"
            name="toEmail"
            id="toEmail"
            value={formData.toEmail}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
        </div>

        <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="subject">
            Subject
            </label>
            <input
            type="text"
            name="subject"
            id="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
        </div>

        <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="body">
            Body
            </label>
            <textarea
            name="body"
            id="body"
            value={formData.body}
            onChange={(e) =>
                setFormData((p) => ({
                ...p,
                body: e.target.value,
                }))
            }
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={5}
            ></textarea>
        </div>

        <button
            type="submit"
            className="w-full bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-600 transition-colors"
        >
            Send Email
        </button>
        </form>
    );
};

export default EmailForm;
