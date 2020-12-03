import React from "react";

function FaqBody(props: {question: string; answer: string;}) {
    return (
            <div className='pad'>
                <span className='question'>
                    {props.question}
                </span>
                <br />
                <br />
                <span className='pad meta'>
                    <text>
                        {props.answer}
                    </text>
                </span>
            </div>
    );
}

export default FaqBody;