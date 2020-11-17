import React from "react";

function Body(props: { className: string; img: string; title: string; description: string; }) {
    return (
        <div className={props.className} >
            <div className="small-div">
                <i className={props.className}></i>
                <img src='./metamask.png' alt='' />
            </div>

            <div className="big-div">
                <span className='div-title'>
                    {props.title}
                </span>
                <br />
                <span>
                    <text>{props.description}</text>
                </span>
            </div>
        </div>
    );
}

export default Body;