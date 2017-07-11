require 'erb'

$message_symbols = {
  ':music:' => '♫♫♫♫♫',
  ':rocket:' => '🚀',
  ':sat:' => '🛰',
  ':satellite:' => '🛰'
}

def render_erb fname
  file = File.read("#{fname}.erb")
  ERB.new(file).result(binding)
end

def reddit_post
  if session[:events]
    "#{session[:intro]}\n\n#{session[:viewing]}\n\n### Live Updates\n#{format_events session[:events]}\n\n#{session[:stats]}\n\n#{session[:mission]}\n\n#{session[:landing]}\n\n#{session[:resources]}\n\n#{session[:participate]}"
  else
    "#{session[:intro]}\n\n#{session[:viewing]}\n\n#{session[:stats]}\n\n#{session[:mission]}\n\n#{session[:landing]}\n\n#{session[:resources]}\n\n#{session[:participate]}"
  end
end

def post_info id
  submission = request.env['redd.session'].from_ids ["t3_#{id}"].to_ary
  {
    'score' => submission[0].score,
    'num_comments' => submission[0].num_comments,
    'html' => submission[0].selftext_html
  }
end

def make_post title, text=''
  request
    .env['redd.session']
    .subreddit('spacextesting')
    .submit title, text: text, sendreplies: false
end

def update_post
  if session[:post] == nil
    post = make_post 'Testing automated post creation', reddit_post
    session[:post] = post.id
  else
    post = request.env['redd.session'].from_ids ["t3_#{session[:post]}"]
    post[0].edit reddit_post
  end
  post_info(session[:post])['html']
end

def format_events events
  if events != nil
    str = "| Time | Update |\n| --- | --- |"
    events.each do |event|
      event = event[1]
      if event[1] == '' then next end  # only display events with message
      $message_symbols.each do |k,v| event[1][k] &&= v end  # substitute where possible
      str += "\n| #{event[0]} | #{event[1]} |"
    end
  end
  str
end
