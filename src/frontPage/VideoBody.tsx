import React from "react";

function VideoBody(props: { className: string; video: string; title: string }) {
  return (
    <div className={props.className}>
      <i className={props.className}></i>
      <div className="big-div">
        <div className="div-title-2 mb-5">{props.title}</div>
        <div>
          <video width="100%" height="100%" controls>
            <source src={props.video} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </div>
  );
}

export default VideoBody;
