require 'erb'

def render_erb fname
  file = File.read("#{fname}.erb")
  ERB.new(file).result(binding)
end

def reddit_post
  "#{session[:intro]}\n\n#{session[:viewing]}\n\n#{session[:stats]}\n\n#{session[:mission]}\n\n#{session[:landing]}\n\n#{session[:resources]}\n\n#{session[:participate]}"
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
