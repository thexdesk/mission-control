require 'erb'

def render_erb fname
  file = File.read("#{fname}.erb")
  ERB.new(file).result(binding)
end

def reddit_post
  "#{session[:intro]}\n
  #{session[:viewing]}\n
  #{session[:stats]}\n
  #{session[:mission]}\n
  #{session[:landing]}\n
  #{session[:resources]}\n
  #{session[:participate]}"
end

def post_info id
  session = request.env['redd.session']
  submission = session.from_ids ["t3_#{id}"].to_ary
  {
    'score' => submission[0].score,
    'num_comments' => submission[0].num_comments,
    'html' => submission[0].selftext_html
  }
end
